// ============================================================
// widget.ts — Web Component 入口
// 用法: <script src="widget.js"></script>
//       <ai-avatar api-key="sk-..." theme="light" auto-open></ai-avatar>
// 注: api-key 也支持 token 别名(后端 /projects/:id/embed-code 返回的 widget
//     模板 + console embed 页 + 接口文档历史一直用的是 token=,SDK 这边接住)。
// ============================================================

import type { AvatarConfig, AvatarInstance } from './types.js';
import { createBridge } from './iframe-bridge.js';

class AIAvatarElement extends HTMLElement {
  private _instance: AvatarInstance | null = null;

  static get observedAttributes() {
    return [
      'agent-id', 'api-key', 'token', 'base-url', 'api-url',
      'theme', 'primary-color', 'position', 'size', 'scale',
      'auto-open', 'auto-open-delay', 'greeting',
      'voice-input', 'voice-output', 'chat-mode',
      'llm-mode', 'chat-panel', 'locale',
      'lazy-load', 'z-index', 'interactive',
      'left', 'right', 'top', 'bottom', 'width', 'height',
    ];
  }

  connectedCallback() {
    // 延迟初始化，确保属性已设置
    requestAnimationFrame(() => this._init());
  }

  disconnectedCallback() {
    this._instance?.destroy();
    this._instance = null;
  }

  attributeChangedCallback() {
    // 属性变更时重建（简单策略，MVP 够用）
    if (this._instance) {
      this._instance.destroy();
      this._instance = null;
      this._init();
    }
  }

  private _init() {
    // api-key 是规范属性名;token 是后端文档/embed-code 输出的历史名,二者等价
    const apiKey = this.getAttribute('api-key') ?? this.getAttribute('token');
    if (!apiKey) {
      console.error('[ai-avatar] Missing required attribute: api-key (or token)');
      return;
    }

    // attr → number|string: 优先解析为 number, 失败时保留 string (支持 '50vw' 这种 CSS 单位)
    const numOrStr = (attr: string): number | string | undefined => {
      const v = this.getAttribute(attr);
      if (v === null || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    };

    const config: AvatarConfig = {
      agentId: this.getAttribute('agent-id') || undefined,
      apiKey,
      baseUrl: this.getAttribute('base-url') || undefined,
      apiUrl: this.getAttribute('api-url') || undefined,
      appearance: {
        // getAttribute('theme') 返回 string ('dark'/'light'/'auto') 或 null.
        // 此前误写成 `as appearance & {}` + 取 .theme — 字符串上没 .theme 属性,
        // 永远 undefined 走 fallback 'light', 导致 theme="dark" 完全不生效.
        theme: (this.getAttribute('theme') as 'light' | 'dark' | 'auto' | null) || 'light',
        primaryColor: this.getAttribute('primary-color') || '#6366F1',
        position: (this.getAttribute('position') as any) || 'bottom-right',
        size: (this.getAttribute('size') as any) || 'normal',
        scale: this.hasAttribute('scale') ? Number(this.getAttribute('scale')) : undefined,
        avatarType: '3d',
        chatPanel: (this.getAttribute('chat-panel') as 'visible' | 'hidden' | null) || undefined,
        locale: this.getAttribute('locale') || undefined,
        zIndex: this.hasAttribute('z-index') ? Number(this.getAttribute('z-index')) : undefined,
        interactive: this.hasAttribute('interactive')
          ? this.getAttribute('interactive') !== 'false'
          : undefined,
        left: numOrStr('left'),
        right: numOrStr('right'),
        top: numOrStr('top'),
        bottom: numOrStr('bottom'),
        width: numOrStr('width'),
        height: numOrStr('height'),
      },
      behavior: {
        autoOpen: this.hasAttribute('auto-open'),
        autoOpenDelay: parseInt(this.getAttribute('auto-open-delay') || '0', 10),
        greetingMessage: this.getAttribute('greeting') || undefined,
        chatMode: (this.getAttribute('chat-mode') as any) || 'embedded',
        idleAnimation: true,
        llmMode: (this.getAttribute('llm-mode') as 'managed' | 'external' | null) || undefined,
        lazyLoad: this.hasAttribute('lazy-load'),
      },
      features: {
        voiceInput: this.getAttribute('voice-input') !== 'false',
        voiceOutput: this.getAttribute('voice-output') !== 'false',
      },
    };

    this._instance = createBridge({
      config,
      callbacks: {
        onReady: () => this.dispatchEvent(new CustomEvent('avatar-ready')),
        onSpeakEnd: (resp) => this.dispatchEvent(new CustomEvent('avatar-speak-end', { detail: resp })),
        onError: (err) => this.dispatchEvent(new CustomEvent('avatar-error', { detail: err })),
        onModeChange: (mode) => this.dispatchEvent(new CustomEvent('avatar-mode-change', { detail: { mode } })),
        // external llmMode 下用户输入转发: 客户监听 `avatar-user-input` CustomEvent.detail 拿文本
        onUserInput: (msg) => this.dispatchEvent(new CustomEvent('avatar-user-input', { detail: msg })),
        // 数字人 GLB 加载完: Headless 客户监听这个再放开自己的对话 UI 输入.
        // 跟 `avatar-ready` 区分: ready = iframe 容器就绪, loaded = 数字人形象 + 口型就绪.
        onAvatarLoaded: () => this.dispatchEvent(new CustomEvent('avatar-loaded')),
      },
    });
  }

  /** 公开 API 方法 */
  speak(text: string) { this._instance?.speak(text); }
  lipsync(audio: string | File | Blob, text?: string) { this._instance?.lipsync(audio, text); }
  replyText(text: string) { this._instance?.replyText(text); }
  replyAudio(text: string, audio: string | Blob | File) { this._instance?.replyAudio(text, audio); }
  setLoading(loading: boolean) { this._instance?.setLoading(loading); }
  expand() { this._instance?.expand(); }
  collapse() { this._instance?.collapse(); }
  toggle() { this._instance?.toggle(); }
  show() { this._instance?.show(); }
  hide() { this._instance?.hide(); }
  reloadConfig() { this._instance?.reloadConfig(); }
  sendMessage(text: string) { this._instance?.sendMessage(text); }
  /** 销毁实例 + 从 DOM 移除元素. disconnectedCallback 同样会触发 destroy,
   *  但这里先把 _instance 置 null 防止 this.remove() 触发 disconnectedCallback 时
   *  又走一遍底层 destroy (二次调用底层 destroy 本身安全, 仅减少噪音). */
  destroy() {
    const inst = this._instance;
    this._instance = null;
    inst?.destroy();
    this.remove();
  }
  /** 数字人 GLB 是否已加载完, Headless 客户决定 "是否可让用户对话" 用 */
  isAvatarLoaded(): boolean { return this._instance?.isAvatarLoaded() ?? false; }
  /** 等数字人 GLB 加载完, 已加载完则立刻 resolve */
  waitAvatarLoaded(): Promise<void> { return this._instance?.waitAvatarLoaded() ?? Promise.resolve(); }
}

// 注册 Web Component
if (typeof customElements !== 'undefined' && !customElements.get('ai-avatar')) {
  customElements.define('ai-avatar', AIAvatarElement);
}

export { AIAvatarElement };
