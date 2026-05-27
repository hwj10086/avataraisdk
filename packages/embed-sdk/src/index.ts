/**
 * 原生 JS / TypeScript 入口
 *
 * 直接转发底层 sdk/src/sdk.ts —— 无任何额外封装,适合不用框架或自己做包装的场景。
 *
 * 用法:
 *   import { AIAvatar } from '@ai-avatar/embed-sdk';
 *   const avatar = AIAvatar.init({ token: 'sk-...', agentId: 'agent_...' });
 *   avatar.speak('你好');
 */

export { AIAvatar, AIAvatar as default } from '../../../sdk/src/sdk';
export type { InitOptions } from '../../../sdk/src/sdk';
export type {
  AvatarConfig,
  AvatarCallbacks,
  AvatarInstance,
  SpeakRequest,
  SpeakTtsRequest,
  SpeakLipsyncRequest,
  SpeakResponse,
  SpeakAsyncResponse,
  RecordDataJson,
  RecordDataJsonFrame,
  UserInputMessage,
  AvatarMessage,
} from '../../../sdk/src/types';
