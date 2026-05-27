/**
 * React 封装
 *
 * 用法:
 *   import { AIAvatar } from '@ai-avatar/embed-sdk/react';
 *   <AIAvatar token="sk-..." agentId="agent_..." position="bottom-right" theme="light" />
 *
 * 取 imperative 句柄(主动控制 speak / expand):
 *   const ref = useRef<AvatarInstance>(null);
 *   <AIAvatar ref={ref} token="..." />
 *   ref.current?.speak('你好');
 *
 * 注: props 设计为扁平结构(跟 Vue 封装对齐),组件内部自动归并成 SDK 的
 * AvatarConfig 嵌套形状(appearance / behavior / features)。
 */

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  type ForwardedRef,
} from 'react';
import { AIAvatar as AIAvatarSDK } from '../../../sdk/src/sdk';
import type { AvatarInstance, AvatarCallbacks } from '../../../sdk/src/types';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type Theme = 'light' | 'dark' | 'auto';
type Size = 'compact' | 'normal' | 'large';
type LlmMode = 'managed' | 'external';
type ChatPanel = 'visible' | 'hidden';

export interface AIAvatarProps {
  /** API Key(必填,sk-...) — 同时支持 token 别名 */
  token?: string;
  /** API Key 的标准命名,token 的别名 */
  apiKey?: string;
  agentId?: string;
  baseUrl?: string;
  apiUrl?: string;

  /** 外观 */
  position?: Position;
  theme?: Theme;
  primaryColor?: string;
  size?: Size;

  /** 行为 */
  autoOpen?: boolean;
  autoOpenDelay?: number;
  greeting?: string;

  /** 功能开关 */
  voiceInput?: boolean;
  voiceOutput?: boolean;

  /** UI 显示语言, BCP47 (如 'en-US' / 'zh-CN'). 未传则按 navigator.language 自动判定 */
  locale?: string;

  /** 高级 */
  llmMode?: LlmMode;
  chatPanel?: ChatPanel;

  /** 事件回调 */
  onReady?: () => void;
  onSpeakStart?: AvatarCallbacks['onSpeakStart'];
  onSpeakEnd?: AvatarCallbacks['onSpeakEnd'];
  onError?: AvatarCallbacks['onError'];
  onModeChange?: AvatarCallbacks['onModeChange'];
  onUserInput?: AvatarCallbacks['onUserInput'];
}

/**
 * AI Avatar React 组件
 *
 * 注:组件本身不渲染任何 DOM —— SDK 会在 body 上 fixed 定位创建气泡 + iframe。
 * 因此放在任何位置都行,通常放在 App 根组件。
 */
function AIAvatarComponent(
  props: AIAvatarProps,
  ref: ForwardedRef<AvatarInstance>,
) {
  const instanceRef = useRef<AvatarInstance | null>(null);

  // 只在挂载时 init,卸载时 destroy。
  // 不监听 props 变化触发重建 —— SDK 内部状态(iframe 实例、对话历史)重建代价大,
  // 改 props 通过 reloadConfig / 显式方法控制更合理。
  useEffect(() => {
    instanceRef.current = AIAvatarSDK.init({
      apiKey: props.apiKey ?? props.token,
      token: props.token,
      agentId: props.agentId,
      baseUrl: props.baseUrl,
      apiUrl: props.apiUrl,
      appearance: {
        position: props.position,
        theme: props.theme,
        primaryColor: props.primaryColor,
        size: props.size,
        chatPanel: props.chatPanel,
        locale: props.locale,
      },
      behavior: {
        autoOpen: props.autoOpen,
        autoOpenDelay: props.autoOpenDelay,
        greetingMessage: props.greeting,
        llmMode: props.llmMode,
      },
      features: {
        voiceInput: props.voiceInput,
        voiceOutput: props.voiceOutput,
      },
      onReady: props.onReady,
      onSpeakStart: props.onSpeakStart,
      onSpeakEnd: props.onSpeakEnd,
      onError: props.onError,
      onModeChange: props.onModeChange,
      onUserInput: props.onUserInput,
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => instanceRef.current as AvatarInstance, []);

  return null;
}

const AIAvatar = forwardRef<AvatarInstance, AIAvatarProps>(AIAvatarComponent);
AIAvatar.displayName = 'AIAvatar';

export { AIAvatar };
export default AIAvatar;
export type { AvatarInstance, AvatarConfig, AvatarCallbacks } from '../../../sdk/src/types';
