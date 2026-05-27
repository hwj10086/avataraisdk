/**
 * 共享类型 —— 让宿主项目可以单独引用类型而不引入 runtime 代码
 *
 * 用法:
 *   import type { AvatarConfig, AvatarInstance } from '@ai-avatar/embed-sdk/types';
 */

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
