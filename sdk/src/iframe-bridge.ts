// ============================================================
// iframe-bridge.ts — 父页 ↔ iframe postMessage 通信层
// 共享于 sdk.ts / widget.ts / embed.html 三入口
// ============================================================

import type { AvatarConfig, AvatarMessage, AvatarCallbacks, AvatarInstance } from './types.js';

// 构建时注入（见 vite.config.ts 的 define 字段）。
// 未注入(npm 包源码直接 import / 客户自打包未设 define)时 fallback 到生产域名,
// 跟文档默认值保持一致 — 客户最常见预期就是用生产, 本地开发的人会显式传 baseUrl 或在
// 自己的 vite.define / .env 里把 __EMBED_BASE_URL__ 设成 https://localhost:3003.
declare const __EMBED_BASE_URL__: string | undefined;
const DEFAULT_EMBED_BASE_URL: string =
  typeof __EMBED_BASE_URL__ !== 'undefined' ? __EMBED_BASE_URL__ : 'https://avatar.avataraisdk.com';

function isAvatarMsg(data: unknown): data is AvatarMessage {
  return typeof data === 'object' && data !== null && (data as any).__avatar === true;
}

/** Base64url 编码配置（与嵌入端 ConfigManager 解码对齐） */
function encodeConfig(config: AvatarConfig): string {
  const json = JSON.stringify(config);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** number → 'Npx' / string 原样透传 / undefined → undefined */
function toCss(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

/** 生成唯一消息 ID */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── bubble svg 资产 — spinner(加载中) + chat(就绪) ──
// 加载中用 spinner 给用户即时反馈; iframe HTML / Three.js / SessionManager 没就绪前
// 就算用户点了 bubble, EXPAND postMessage 也可能 race 丢失(WebglManager 还没注册 listener,
// 或 OnExpand 还没注册). 用 spinner 阻止用户在这窗口期点击, 同时 click 缓冲 pendingExpand,
// handleReady 后 auto replay.
const BUBBLE_SPINNER_SVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="animation: ai-avatar-spin 1s linear infinite;">
  <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none"/>
  <path d="M21 12a9 9 0 0 0-9-9" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
</svg>`;
const BUBBLE_CHAT_SVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="1.5"/>
  <circle cx="8" cy="12" r="1.5" fill="white"/><circle cx="12" cy="12" r="1.5" fill="white"/><circle cx="16" cy="12" r="1.5" fill="white"/>
</svg>`;

const SPINNER_KEYFRAMES_ID = 'ai-avatar-spin-keyframes';
function ensureSpinnerKeyframes(): void {
  if (document.getElementById(SPINNER_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = SPINNER_KEYFRAMES_ID;
  style.textContent = '@keyframes ai-avatar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export interface BridgeOptions {
  config: AvatarConfig;
  callbacks?: AvatarCallbacks;
  /** 挂载容器（默认 document.body） */
  container?: HTMLElement;
}

/**
 * 创建 iframe bridge 实例。
 * 负责：创建 iframe + 气泡按钮、postMessage 握手、暴露控制 API。
 */
export function createBridge(options: BridgeOptions): AvatarInstance {
  const { config, callbacks } = options;

  // llmMode 默认是历史包袱: 早期默认 'managed' (走平台 LLM), 现在主流场景是 'external'
  // (客户自带 LLM 借壳数字人). 客户漏配 llmMode 时, SDK 静默走平台链路 → 用户输入
  // 触发 /avatar/chat 而不是 onUserInput 回调, 表现为 "数字人没回复" 且没任何报错,
  // 是接入文档里最常被踩的坑. 没显式设时 warn 一下让客户做明确选择.
  if (config.behavior?.llmMode === undefined) {
    console.warn(
      '[ai-avatar] behavior.llmMode 未显式设置, 默认走 \'managed\' (使用平台 LLM). ' +
      '如果你是接入自家 LLM, 必须显式设 \'external\', 否则用户输入不会触发 onUserInput, ' +
      '数字人不会回复. 若确实使用平台 LLM, 可显式设 \'managed\' 以消除此警告.'
    );
  }

  const container = options.container || document.body;
  // 优先级：宿主调用时传入的 config.baseUrl > 构建时注入的 __EMBED_BASE_URL__ > 回退到生产 avatar.avataraisdk.com
  const baseUrl = config.baseUrl || DEFAULT_EMBED_BASE_URL;
  // 父页 origin：SDK 运行在父页上下文,默认就是当前 window.origin;
  // 嵌套 iframe 场景下由宿主显式传 config.parentOrigin 覆盖。
  const parentOrigin = config.parentOrigin
    || (typeof window !== 'undefined' ? window.location.origin : '');

  // ── Headless 模式检测 (容器创建前用到) ──
  // chatMode='hosted' 或 chatPanel='hidden' 任一为真 → 客户走 Headless 接入 (自渲对话 UI)
  // SDK 跳过气泡 + iframe 直接展开到指定尺寸, 跟客户自己的 UI 错开
  // (非 Headless 时保留 "气泡 → 点击展开" 交互供 demo / 默认对话场景使用)
  const isHeadless =
    config.behavior?.chatMode === 'hosted' ||
    config.appearance?.chatPanel === 'hidden';

  const lazyLoad = config.behavior?.lazyLoad === true;

  // ── 位置解析: 像素自定义优先于 position 预设 ──
  // 如果 left/right/top/bottom 任一存在 → 用像素值, position 字段忽略
  // (这样客户能精确定位, 也能只指定单边 / 双边自由组合)
  const ap = config.appearance || {};
  const hasPixelPos = ap.left !== undefined || ap.right !== undefined
                   || ap.top !== undefined || ap.bottom !== undefined;
  const pos = ap.position || 'bottom-right';
  const [posV, posH] = pos.split('-') as [string, string];

  // ── 容器 (始终创建, lazyLoad 仅延迟 iframe + bubble) ──
  const wrapper = document.createElement('div');
  wrapper.id = 'ai-avatar-container';
  // 客户可通过 appearance.zIndex 调低层级让自己的 UI 盖在数字人之上 (默认 int 最大值)
  const zIndexVal = ap.zIndex ?? 2147483647;
  // Headless 默认 pointer-events: none 让客户 UI 可点击穿透; 非 Headless 默认 auto.
  // 客户可通过 appearance.interactive 显式覆盖.
  const interactive = ap.interactive ?? !isHeadless;
  const baseStyle: Record<string, string> = {
    position: 'fixed',
    zIndex: String(zIndexVal),
    pointerEvents: interactive ? 'auto' : 'none',
  };
  if (hasPixelPos) {
    // 像素自定义: 客户传哪边就设哪边, 其余 auto (避免 left+right 自动拉伸异常)
    if (ap.left !== undefined) baseStyle.left = toCss(ap.left)!;
    if (ap.right !== undefined) baseStyle.right = toCss(ap.right)!;
    if (ap.top !== undefined) baseStyle.top = toCss(ap.top)!;
    if (ap.bottom !== undefined) baseStyle.bottom = toCss(ap.bottom)!;
  } else {
    // 沿用 position 预设 (默认 bottom-right 24px 边距)
    baseStyle[posV] = '24px';
    baseStyle[posH] = '24px';
  }
  if (lazyLoad) baseStyle.display = 'none';  // lazyLoad: wrapper 占位但不可见
  Object.assign(wrapper.style, baseStyle);
  container.appendChild(wrapper);

  // ── 状态 ──
  let isReady = false;
  let isExpanded = false;
  let isCreated = false;       // iframe + bubble 是否已创建 (lazyLoad 控制)
  let isVisible = !lazyLoad;   // wrapper 是否可见
  let iframe: HTMLIFrameElement | null = null;
  let bubble: HTMLDivElement | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  // 数字人 GLB 加载完 (PureJS AVATAR_LOADED postMessage). 跟 isReady 区分:
  //   isReady       = iframe HTML/JS 容器就绪 (能发指令了)
  //   isAvatarLoaded = 数字人 GLB + BlendShape 都就绪 (能让用户对话了)
  // Headless 客户必须等这个 ready 才让用户输入, 否则音频先于数字人形象出现.
  let isAvatarLoaded = false;
  const avatarLoadedResolvers: Array<() => void> = [];
  function markAvatarLoaded() {
    if (isAvatarLoaded) return;
    isAvatarLoaded = true;
    try { callbacks?.onAvatarLoaded?.(); } catch (e) { console.error('[avatar] onAvatarLoaded threw', e); }
    const cbs = avatarLoadedResolvers.splice(0);
    for (const cb of cbs) { try { cb(); } catch (e) { console.error(e); } }
  }
  // 用户在 !isReady 期间点 bubble 的缓冲. handleReady 后自动 replay api.expand().
  // 解决 race: iframe HTML / Three.js 还没加载完时点 bubble, EXPAND postMessage 会丢失
  // (WebglManager.message listener 没注册 / OnExpand handler 没注册都可能).
  let pendingExpand = false;

  // ── 尺寸常量 + 解析像素覆盖 ──
  const sizeMap = { compact: { w: '340px', h: '55vh' }, normal: { w: '400px', h: '66vh' }, large: { w: '480px', h: '80vh' } };
  const sizePreset = sizeMap[ap.size || 'normal'] || sizeMap.normal;
  // 像素自定义宽高覆盖预设单个维度 (客户给 width 不给 height 时高度仍用预设)
  const iframeSize = {
    w: toCss(ap.width) ?? sizePreset.w,
    h: toCss(ap.height) ?? sizePreset.h,
  };

  // ── postMessage 监听 (始终监听, 即使 lazyLoad iframe 未创建) ──
  function onMessage(e: MessageEvent) {
    const d = e.data;
    if (!isAvatarMsg(d)) {
      // 兼容旧协议 UnityReady
      if (d === 'initUnity' || (d && d.type === 'UnityReady')) {
        handleReady();
      }
      return;
    }
    switch (d.type) {
      case 'READY':
        handleReady();
        break;
      case 'ERROR':
        callbacks?.onError?.(d.payload as { code: string; message: string });
        break;
      case 'MESSAGE':
        callbacks?.onSpeakEnd?.(d.payload as any);
        break;
      case 'MODE_CHANGE': {
        const mode = (d.payload as { mode?: string } | undefined)?.mode;
        callbacks?.onModeChange?.(mode as any);
        // PureJS 端 ChatPanel X 触发 setMode('bubble') 后会发这条; SDK 同步把外层
        // wrapper 折叠回 bubble (iframe 缩到 0×0, 重新显示 wrapper bubble).
        // collapse() 内部 `if (!isExpanded) return` 守卫, 多次触发不会重入.
        if (mode === 'bubble') api.collapse();
        break;
      }
      case 'USER_MESSAGE':
        // external llmMode: 用户输入 (文字 / 语音 STT) 产生的文本, 客户监听这条把 text 喂自己 LLM
        callbacks?.onUserInput?.(d.payload as import('./types.js').UserInputMessage);
        break;
      case 'AVATAR_LOADED':
        // PureJS 端 GLB + BlendShape 都就绪 (GlbManager.markReady), Headless 客户的
        // 关键信号: 之前别让用户对话, 之后才放开输入.
        markAvatarLoaded();
        break;
    }
  }
  window.addEventListener('message', onMessage);

  function handleReady() {
    if (isReady) return;
    isReady = true;
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = null;
    // bubble svg 从 spinner 切到 chat icon: PureJS 端 ready, 后续 click 能正常 expand.
    if (bubble) bubble.innerHTML = BUBBLE_CHAT_SVG;
    // 注入私有标志告诉 PureJS "我是 SDK 接入(外层 wrapper 已经管 bubble + 折叠)",
    // PureJS 端收到后跳过自己的 BubbleButton / AvatarCloseButton, 避免两层 UI 冲突.
    // iframe 直接接入不会带这字段, PureJS 仍走完整 bubble + avatar + full 三态流程.
    send('INIT', { ...config, __sdkWrapper: true });
    callbacks?.onReady?.();
    // replay 用户在 !isReady 期间点 bubble 的 pending expand 意图.
    if (pendingExpand) {
      pendingExpand = false;
      api.expand();
    }
  }

  function send(type: string, payload: unknown) {
    if (!iframe?.contentWindow) return;
    const msg: AvatarMessage = { __avatar: true, id: uid(), type, payload };
    iframe.contentWindow.postMessage(msg, '*');
  }

  // ── iframe + bubble 创建 (init 立即调 / lazyLoad 首次 show 时调) ──
  function createIframeAndUI() {
    if (isCreated) return;
    isCreated = true;

    // iframe
    // __sdkWrapper 必须在 URL config 阶段就编入: PureJS 端从 URL 解出 config 后立即 setupUI()
    // (avatar-app.ts:90-92), 这时还没收到 READY→INIT 回环, 如果 __sdkWrapper 只通过 INIT
    // postMessage 传, isSdkWrapper 在 setupUI 时仍是 false, PureJS 会创建自己的 BubbleButton —
    // 跟外层 SDK wrapper bubble 形成两层 UI 打架(关闭对话框时先闪 PureJS 内层 bubble,
    // 0.3s 后再切到 SDK 外层 bubble). 编入 URL config 让 isSdkWrapper 在 setupUI 时就生效.
    const encoded = encodeConfig({ ...config, __sdkWrapper: true } as AvatarConfig);
    iframe = document.createElement('iframe');
    // parentOrigin 作为独立 query 传给 iframe, PureJS 直接从 location.search 读取,
    // 无需解 base64 config, 且便于后端白名单校验时读 X-Parent-Origin header.
    const parentOriginQuery = parentOrigin ? `&parentOrigin=${encodeURIComponent(parentOrigin)}` : '';
    iframe.src = `${baseUrl}/?config=${encoded}${parentOriginQuery}`;
    // autoplay 必须显式声明: cross-origin iframe 默认 Permission Policy 不允许 audio.play(),
    // 没声明的话 widget.speak() 后端有返回但 SpeakClient.playResult 里 audio.play() 被浏览器拦截
    // 落到 catch 警告 "may need user gesture", 表现就是 "有响应但数字人不出声".
    // Headless / lazyLoad / async-after-await 场景下 user activation 很难跨 iframe 传, 这里
    // 用 Permission Policy 直接豁免是最稳的路径.
    iframe.allow = 'autoplay; microphone';
    iframe.setAttribute('allowtransparency', 'true');
    // iframe 内部锚点跟 wrapper 实际锚一致, 否则 expand 时 iframe 从错误的边向外长.
    // 例: 客户配 left:50% bottom:100, wrapper fixed left:50% bottom:100 + 0 高度;
    //     若 iframe 强制 top:0 left:0 → iframe 从底部锚那条线向 *下* 长 600px,
    //     大部分溢出 viewport. 正确做法 iframe bottom:0 left:0 让它向上长.
    // 同时 top+bottom 都给时 wrapper 高度被拉伸填充, iframe 沿用 top:0 即可.
    const iframeAnchorV = hasPixelPos
      ? (ap.top !== undefined ? 'top' : (ap.bottom !== undefined ? 'bottom' : 'top'))
      : posV;
    const iframeAnchorH = hasPixelPos
      ? (ap.left !== undefined ? 'left' : (ap.right !== undefined ? 'right' : 'left'))
      : posH;
    Object.assign(iframe.style, {
      border: 'none',
      width: '0',
      height: '0',
      overflow: 'hidden',
      transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
      opacity: '0',
      position: 'absolute',
      [iframeAnchorV]: '0',
      [iframeAnchorH]: '0',
      background: 'transparent',
      borderRadius: '16px',
      // 整体缩放从锚点角展开, 视觉位置不偏移
      transformOrigin: `${iframeAnchorV} ${iframeAnchorH}`,
    });
    wrapper.appendChild(iframe);

    // bubble (仅非 Headless)
    const primaryColor = ap.primaryColor || '#6366F1';
    if (!isHeadless) {
      ensureSpinnerKeyframes();
      bubble = document.createElement('div');
      Object.assign(bubble.style, {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, 30)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: `0 8px 32px ${primaryColor}66`,
        transition: 'transform 0.2s ease',
      });
      // 起手 spinner — handleReady() 时切到 chat svg. 防止 iframe 还没加载完用户点 bubble
      // 引发 EXPAND race 丢失 (现象: bubble 消失但 panel 不展开, iframe 拉大露出内层默认 mode).
      bubble.innerHTML = BUBBLE_SPINNER_SVG;
      bubble.addEventListener('mouseenter', () => { bubble!.style.transform = 'scale(1.1)'; });
      bubble.addEventListener('mouseleave', () => { bubble!.style.transform = 'scale(1)'; });
      bubble.addEventListener('click', () => {
        if (isExpanded) return;
        if (!isReady) {
          // PureJS 还在加载, 标记 pending 但保持 bubble 可见 + spinner 转 — 用户能感知 "loading 中".
          // handleReady() 时自动 replay api.expand().
          pendingExpand = true;
          return;
        }
        api.expand();
      });
      wrapper.appendChild(bubble);
    }

    // Ping 轮询直到 PureJS 端 READY (跟 iframe 同生命周期)
    pingTimer = setInterval(() => {
      if (isReady) { if (pingTimer) clearInterval(pingTimer); pingTimer = null; return; }
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { __avatar: true, id: '', type: 'PING', payload: null } satisfies AvatarMessage,
          '*',
        );
      }
    }, 300);

    // 自动展开:
    //  - Headless: iframe 必须立即就位展示数字人 (不依赖客户传 autoOpen)
    //  - 非 Headless: 按 autoOpen 配置决定
    if (isHeadless) {
      api.expand();
    } else if (config.behavior?.autoOpen) {
      const delay = config.behavior.autoOpenDelay || 0;
      setTimeout(() => api.expand(), delay);
    }
  }

  // ── API ──
  const api: AvatarInstance = {
    speak(text, options) {
      send('SPEAK', { mode: 'tts', text, ...options });
    },
    lipsync(audio, text) {
      // 第一参两种形态:
      //  - string (audioUrl): 走 SPEAK_AUDIO 链路, PureJS 端 fetch URL → Blob → /lipsync/upload.
      //    跟 replyAudio(text, url) 等价, 只是 lipsync 语义上不强调文本.
      //  - Blob | File: 走 SPEAK + mode=lipsync 链路, postMessage structured clone 跨 origin
      //    透传 Blob → /lipsync/upload multipart 直接上传, 比 URL 少一次 fetch.
      if (typeof audio === 'string') {
        send('SPEAK_AUDIO', { text: text ?? '', audioUrl: audio });
      } else {
        send('SPEAK', { mode: 'lipsync', audio, text });
      }
    },
    show() {
      if (!isCreated) createIframeAndUI();
      if (!isVisible) {
        wrapper.style.display = '';
        isVisible = true;
      }
    },
    hide() {
      if (isVisible) {
        wrapper.style.display = 'none';
        isVisible = false;
      }
    },
    expand() {
      if (isExpanded || !iframe) return;
      isExpanded = true;
      if (bubble) bubble.style.display = 'none';
      // appearance.scale 控制整体视觉缩放(默认 1, 不缩); iframe 内部布局不变, 只是视觉变小
      const scaleVal = ap.scale ?? 1;
      Object.assign(iframe.style, {
        width: iframeSize.w,
        height: iframeSize.h,
        opacity: '1',
        transform: scaleVal !== 1 ? `scale(${scaleVal})` : 'none',
      });
      send('EXPAND', null);
    },
    collapse() {
      // Headless 模式没有气泡可收回, collapse 是 no-op (数字人始终在场)
      if (isHeadless) return;
      if (!isExpanded || !iframe) return;
      isExpanded = false;
      Object.assign(iframe.style, { width: '0', height: '0', opacity: '0', transform: 'none' });
      setTimeout(() => { if (bubble) bubble.style.display = 'flex'; }, 300);
      send('COLLAPSE', null);
    },
    toggle() {
      if (isExpanded) this.collapse(); else this.expand();
    },
    reloadConfig() {
      send('RELOAD_CONFIG', null);
    },
    sendMessage(text) {
      send('SEND_MESSAGE', { text });
    },
    replyText(text) {
      // external llmMode A 路线: 客户 LLM 文本回传, 我们走 /avatar/speak 拿 TTS+口型
      send('SPEAK_TEXT', { text });
    },
    replyAudio(text, audio) {
      // B 路线 客户 LLM 文本 + 音频回传, 我们只做口型.
      // 第二参支持: string (audioUrl, 需 CORS) / Blob | File (postMessage structured clone 跨 origin 透传).
      // payload 字段名按形态分: audioUrl (string) vs audio (Blob/File), PureJS 端 WebglManager 按字段区分处理.
      if (typeof audio === 'string') {
        send('SPEAK_AUDIO', { text, audioUrl: audio });
      } else {
        send('SPEAK_AUDIO', { text, audio });
      }
    },
    setLoading(loading) {
      send('SET_LOADING', { loading });
    },
    isAvatarLoaded() {
      return isAvatarLoaded;
    },
    waitAvatarLoaded() {
      if (isAvatarLoaded) return Promise.resolve();
      return new Promise<void>((res) => { avatarLoadedResolvers.push(res); });
    },
    destroy() {
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = null;
      window.removeEventListener('message', onMessage);
      wrapper.remove();
      iframe = null;
      bubble = null;
      isCreated = false;
    },
  };

  // ── 启动 ──
  // 非 lazyLoad: init 立即创建 iframe (走老路径, 客户无感)
  // lazyLoad: 等客户调 widget.show() 才创建, init 仅占位 wrapper (隐藏)
  if (!lazyLoad) {
    createIframeAndUI();
  }

  return api;
}

/** 简易颜色偏移（用于渐变） */
function adjustColor(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
