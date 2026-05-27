// ============================================================
// sdk.ts — JS SDK 入口
// 用法: <script src="sdk.js"></script>
//       AIAvatar.init({ apiKey: 'sk-...', onReady() { ... } })
// 注: apiKey 也支持 token 别名(后端 /projects/:id/embed-code 返回的 sdk
//     模板 + console embed 页 + 接口文档历史一直用 token,SDK 这边接住)。
// ============================================================

import type { AvatarConfig, AvatarCallbacks, AvatarInstance } from './types.js';
import { createBridge } from './iframe-bridge.js';

export type { AvatarConfig, AvatarCallbacks, AvatarInstance } from './types.js';

let _instance: AvatarInstance | null = null;

/**
 * apiKey 可写成 apiKey 或 token,任传其一即可。
 * 类型上 apiKey 设为可选,init 内做归一化保证最终透传给 bridge 的 config 一定有值。
 */
export interface InitOptions extends Omit<AvatarConfig, 'apiKey'> {
  apiKey?: string;
  /** apiKey 的别名(后端 embed-code 输出的字段名) */
  token?: string;
  onReady?: () => void;
  onSpeakStart?: AvatarCallbacks['onSpeakStart'];
  onSpeakEnd?: AvatarCallbacks['onSpeakEnd'];
  onError?: AvatarCallbacks['onError'];
  onModeChange?: AvatarCallbacks['onModeChange'];
  /**
   * external llmMode 下用户输入(文字 / 语音 STT)产生的文本回调。
   * 客户监听这条把 text 喂自己 LLM,拿到回复后调 widget.replyText() / replyAudio() 回传。
   */
  onUserInput?: AvatarCallbacks['onUserInput'];
}

/**
 * 初始化 AI Avatar 数字人
 * @returns AvatarInstance 控制 API
 */
function init(options: InitOptions): AvatarInstance {
  if (_instance) {
    console.warn('[AIAvatar] Already initialized — destroying previous instance');
    _instance.destroy();
  }

  const {
    onReady, onSpeakStart, onSpeakEnd, onError, onModeChange, onUserInput,
    token, apiKey,
    ...rest
  } = options;
  const finalKey = apiKey ?? token;
  if (!finalKey) {
    throw new Error(
      '[AIAvatar] init() 缺少必填项 apiKey (或 token)。' +
      '请在 https://avataraisdk.com 控制台生成 sk-... 开头的 key 后传入。',
    );
  }
  if (!finalKey.startsWith('sk-')) {
    console.warn('[AIAvatar] apiKey 格式异常,通常应以 sk- 开头');
  }
  const config: AvatarConfig = { ...rest, apiKey: finalKey };

  _instance = createBridge({
    config,
    callbacks: { onReady, onSpeakStart, onSpeakEnd, onError, onModeChange, onUserInput },
  });

  return _instance;
}

/** 获取当前实例 */
function getInstance(): AvatarInstance | null {
  return _instance;
}

/** 销毁当前实例 */
function destroy(): void {
  _instance?.destroy();
  _instance = null;
}

// 导出命名空间
export const AIAvatar = { init, getInstance, destroy };

// 挂载到 window（供 <script> 标签使用）
if (typeof window !== 'undefined') {
  (window as any).AIAvatar = AIAvatar;
}

export default AIAvatar;
