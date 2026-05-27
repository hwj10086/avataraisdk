// ============================================================
// AI Avatar Embed SDK — 共享类型定义
// ============================================================

/** SDK 初始化配置 */
export interface AvatarConfig {
  /** 数字人 Agent ID（可选，后端按 API Key 自动推断） */
  agentId?: string;
  /** API Key（必填，格式 sk-...） */
  apiKey: string;
  /** 外观配置 */
  appearance?: {
    avatarType?: '2d' | '3d' | 'live2d';
    theme?: 'light' | 'dark' | 'auto';
    primaryColor?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    size?: 'compact' | 'normal' | 'large';
    /**
     * 整体视觉缩放系数(数字人 + 对话框等比例缩放).
     * 1 = 原大小; 0.8 = 缩小 1/5; 1.2 = 放大 1/5. 推荐范围 [0.5, 1.5].
     * 用 CSS transform: scale 实现, iframe 内部布局不变, 仅视觉等比缩放.
     * 不影响气泡按钮(bubble) 大小.
     */
    scale?: number;
    /**
     * 对话框显示模式:
     *  - 'visible' (默认): 我们提供完整对话框 UI
     *  - 'hidden' (Headless): 仅渲染数字人, 客户自己做对话框 UI, 通过
     *    `avatar.speak()` / `avatar.lipsync()` / postMessage 程序化驱动开口.
     */
    chatPanel?: 'visible' | 'hidden';
    /**
     * 对话 UI 显示语言 (BCP47, 如 'en-US' / 'zh-CN').
     * 未传时 PureJS 按 navigator.language 自动判定. 当宿主页知道用户偏好
     * (例如 WordPress 站点语言) 时, 显式传入比浏览器自动检测更稳定.
     * 已支持: 'en-US' (默认), 'zh-CN'. 其它语种回退到 en-US.
     */
    locale?: string;
    /**
     * iframe 容器的 CSS z-index, 默认 2147483647 (int 最大值, 永远在最上).
     * 客户 UI 元素被遮挡时调低此值即可让客户 UI 盖在数字人之上.
     */
    zIndex?: number;
    /**
     * 是否接收鼠标/触摸事件.
     *  - true: iframe 拦截鼠标点击 (可与数字人交互)
     *  - false: iframe pointer-events: none, 鼠标穿透到下层客户 UI
     *  默认值: Headless 模式 (chatMode='hosted' 或 chatPanel='hidden') 默认 false,
     *         其他情况默认 true.
     *  Headless 客户用自己的对话框 UI, 数字人本身无需点击, 默认穿透不挡 UI.
     */
    interactive?: boolean;
    /**
     * 像素自定义位置 (任一存在则忽略 position 字段). 可填 number (默认 px) 或 CSS
     * 字符串 (如 '10vw' / '5%' / '100px'). 同时给 left + right 等于横向居中拉伸,
     * 给 left + width 等于固定 left + 指定宽度 (推荐).
     */
    left?: number | string;
    /** @see appearance.left */
    right?: number | string;
    /** @see appearance.left */
    top?: number | string;
    /** @see appearance.left */
    bottom?: number | string;
    /**
     * iframe 展开后的像素宽度 (覆盖 size 预设的宽度). 可填 number (px) 或 CSS 字符串.
     * 不影响 bubble 气泡 (固定 64×64).
     */
    width?: number | string;
    /** @see appearance.width */
    height?: number | string;
  };
  /** 行为配置 */
  behavior?: {
    autoOpen?: boolean;
    autoOpenDelay?: number;
    idleAnimation?: boolean;
    greetingMessage?: string;
    greetingDelay?: number;
    chatMode?: 'hosted' | 'embedded';
    /**
     * LLM 提供方:
     *  - 'managed' (默认): 我们代理 LLM (走 /avatar/chat SSE)
     *  - 'external': 客户自带 LLM. 用户输入产生的文本通过 onUserInput 回调
     *    / postMessage `USER_MESSAGE` 交给客户, 客户调自己 LLM 后通过
     *    `avatar.speak()` 或 postMessage `SPEAK_TEXT` / `SPEAK_AUDIO` 回传.
     */
    llmMode?: 'managed' | 'external';
    /**
     * 懒加载. 默认 false (init 立即创建 iframe + 加载数字人 + 建 session).
     * 设为 true 时 init 仅占位 wrapper, 直到客户调 widget.show() 才真正创建
     * iframe + 触发 GLB 下载 + 建 session. 适合 "用户点了某个按钮才让数字人出场" 的场景.
     */
    lazyLoad?: boolean;
  };
  /** 功能开关 */
  features?: {
    voiceInput?: boolean;
    voiceOutput?: boolean;
    fileUpload?: boolean;
    historyPersist?: boolean;
  };
  /** 上下文 */
  context?: {
    pageTitle?: string;
    pageUrl?: string;
    userContext?: Record<string, unknown>;
    voiceId?: string;
    customData?: Record<string, unknown>;
  };
  /** 嵌入端 iframe 的 base URL（构建时通过 __EMBED_BASE_URL__ 注入；npm 包默认 https://avatar.avataraisdk.com） */
  baseUrl?: string;
  /** 后端 API base URL */
  apiUrl?: string;
  /**
   * 父页 origin（用于后端域名白名单校验）。
   * 默认取 window.location.origin；通过 <iframe src="embed.html"> 这种嵌套嵌入时
   * embed.html 会先从 query / document.referrer 推导再传入。
   */
  parentOrigin?: string;
}

/** /speak 模式 A 请求 */
export interface SpeakTtsRequest {
  mode: 'tts';
  text: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav';
}

/** /speak 模式 B 请求（lipsync） */
export interface SpeakLipsyncRequest {
  mode: 'lipsync';
  audio: File | Blob;
  text?: string;
}

export type SpeakRequest = SpeakTtsRequest | SpeakLipsyncRequest;

/** /speak 同步响应 */
export interface SpeakResponse {
  audioUrl: string;
  audioDuration: number;
  visemes: RecordDataJson;
  usage: { chars?: number; seconds?: number };
}

/** /speak 异步响应 */
export interface SpeakAsyncResponse {
  taskId: string;
  estimatedDuration?: number;
}

/** BlendShape 时间轴帧 */
export interface RecordDataJsonFrame {
  time: number;
  location: number[];
  weight: number[];
}

/** BlendShape 时间轴（52 位 ARKit） */
export interface RecordDataJson {
  frames: RecordDataJsonFrame[];
  fileId: string;
  version: string;
}

/** iframe ↔ 父页 postMessage 信封 */
export interface AvatarMessage {
  __avatar: true;
  id: string;
  type: string;
  payload: unknown;
}

/** 用户输入产生的消息 (external llmMode 下 onUserInput 回调 payload) */
export interface UserInputMessage {
  id: string;
  role: 'user';
  content: string;
  timestamp: number;
}

/** SDK 事件回调 */
export interface AvatarCallbacks {
  onReady?: () => void;
  onSpeakStart?: (request: SpeakRequest) => void;
  onSpeakEnd?: (response: SpeakResponse) => void;
  onError?: (error: { code: string; message: string }) => void;
  onModeChange?: (mode: string) => void;
  /**
   * external llmMode 下用户输入(文字/语音 STT)产生的文本. 客户监听这条把 content
   * 喂给自己的 LLM, 拿到回复后调 avatar.replyText() 或 avatar.replyAudio() 回传.
   */
  onUserInput?: (msg: UserInputMessage) => void;
  /**
   * 数字人 GLB 加载完成 + BlendShapePlayer 就绪后触发 (区别于 onReady, 后者是 iframe
   * 容器 ready). Headless 接入客户自渲对话框时应监听这个: 加载完之前别让用户发消息,
   * 否则音频会先于数字人形象播放出来 + 首段无口型, 体验差.
   * 加载完之前调 replyText/replyAudio/speak/lipsync 我们会内部缓冲到加载完再播,
   * 但客户对话框的 "AI 正在思考" 提示会显得卡顿, 所以建议拉一道 UI 防线.
   */
  onAvatarLoaded?: () => void;
}

/** SDK 实例 API */
export interface AvatarInstance {
  speak(text: string, options?: Partial<SpeakTtsRequest>): void;
  /**
   * 仅口型同步 (不需要 TTS, 只对音频做嘴形). 第一参支持:
   *  - string (audioUrl): 我们前端 fetch 拿 Blob → /lipsync/upload (要 CORS)
   *  - Blob | File: postMessage structured clone 跨 origin 透传 → /lipsync/upload (无 CORS)
   * 音频必须是 WAV 容器, ≤10MB. text 可选, 仅作上下文记录, 不消费.
   */
  lipsync(audio: string | File | Blob, text?: string): void;
  /**
   * 显示 widget. 如果是 lazyLoad 模式且 iframe 还未创建, 第一次调用会触发
   * iframe 创建 + GLB 下载 + session 创建; 后续调用仅切换可见性.
   * 跟 expand/collapse 是独立维度: show() 不影响 bubble vs full 的切换.
   */
  show(): void;
  /** 隐藏 widget (整个 wrapper display:none, 数字人 + 气泡都不可见, 但状态保留, 再调 show 可恢复) */
  hide(): void;
  /**
   * external llmMode A 路线: 客户 LLM 文本回传, 我们走后端 TTS + 口型并播放.
   * Headless 模式或自带对话框场景也可直接调用驱动数字人开口.
   */
  replyText(text: string): void;
  /**
   * external llmMode B 路线: 客户 LLM 文本 + 自有音频回传, 我们只做口型.
   *
   * 第二个参数支持两种形态:
   *  - string (audioUrl): 必须开放 CORS 给嵌入端 origin, 我们前端 fetch 拿 Blob 后走口型上传
   *  - Blob | File: 直接传字节, 经 postMessage structured clone 跨 origin 透传, 不走 CORS
   *
   * **音频必须是 WAV 容器**(后端 /lipsync/upload 硬性要求), 单文件 ≤ 10MB.
   * mp3 / m4a / opus 等不支持, 客户需在客户端转 WAV 再传 (Web Audio API / FFmpeg.wasm).
   */
  replyAudio(text: string, audio: string | Blob | File): void;
  /** 显式控制 typing 指示器 (external llmMode 客户 LLM 思考时显示, 通常自动管理) */
  setLoading(loading: boolean): void;
  /**
   * 数字人 GLB 是否已加载完 (相对 onAvatarLoaded 的同步检查).
   * Headless 接入客户在自己 UI 渲染前判断 "是否可以让用户输入".
   */
  isAvatarLoaded(): boolean;
  /**
   * 等数字人 GLB 加载完. 已加载完则立刻 resolve.
   * 比 onAvatarLoaded 更适合 await 链式调用 (`await avatar.waitAvatarLoaded(); show input`).
   */
  waitAvatarLoaded(): Promise<void>;
  expand(): void;
  collapse(): void;
  toggle(): void;
  reloadConfig(): void;
  sendMessage(text: string): void;
  destroy(): void;
}
