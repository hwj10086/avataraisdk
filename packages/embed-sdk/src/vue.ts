/**
 * Vue 3 封装
 *
 * 用法:
 *   <script setup>
 *   import { AIAvatar } from '@ai-avatar/embed-sdk/vue';
 *   </script>
 *   <template>
 *     <AIAvatar token="sk-..." agent-id="agent_..." />
 *   </template>
 *
 * 取 imperative 句柄:
 *   <AIAvatar ref="avatarRef" token="..." />
 *   avatarRef.value?.speak('你好')
 */

import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  type PropType,
} from 'vue';
import { AIAvatar as AIAvatarSDK } from '../../../sdk/src/sdk';
import type { AvatarInstance } from '../../../sdk/src/types';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type Theme = 'light' | 'dark' | 'auto';
type Size = 'compact' | 'normal' | 'large';
type LlmMode = 'managed' | 'external';
type ChatPanel = 'visible' | 'hidden';

export const AIAvatar = defineComponent({
  name: 'AIAvatar',
  props: {
    /** API Key(必填,sk-...) */
    token: { type: String, default: '' },
    /** API Key 标准命名,token 别名 */
    apiKey: { type: String, default: '' },
    agentId: { type: String, default: '' },
    baseUrl: { type: String, default: '' },
    apiUrl: { type: String, default: '' },
    position: { type: String as PropType<Position>, default: 'bottom-right' },
    theme: { type: String as PropType<Theme>, default: 'light' },
    primaryColor: { type: String, default: '#6366F1' },
    size: { type: String as PropType<Size>, default: 'normal' },
    autoOpen: { type: Boolean, default: false },
    autoOpenDelay: { type: Number, default: 0 },
    greeting: { type: String, default: '' },
    voiceInput: { type: Boolean, default: true },
    voiceOutput: { type: Boolean, default: true },
    llmMode: { type: String as PropType<LlmMode>, default: undefined },
    chatPanel: { type: String as PropType<ChatPanel>, default: undefined },
    /** UI 显示语言 (BCP47, 如 'en-US' / 'zh-CN'). 未传则按 navigator.language 自动判定 */
    locale: { type: String, default: undefined },
  },
  emits: ['ready', 'speakStart', 'speakEnd', 'error', 'modeChange', 'userInput'],
  setup(props, { emit, expose }) {
    const instance = ref<AvatarInstance | null>(null);

    onMounted(() => {
      const key = props.apiKey || props.token;
      instance.value = AIAvatarSDK.init({
        apiKey: key,
        token: props.token || undefined,
        agentId: props.agentId || undefined,
        baseUrl: props.baseUrl || undefined,
        apiUrl: props.apiUrl || undefined,
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
          greetingMessage: props.greeting || undefined,
          llmMode: props.llmMode,
        },
        features: {
          voiceInput: props.voiceInput,
          voiceOutput: props.voiceOutput,
        },
        onReady: () => emit('ready'),
        onSpeakStart: (req) => emit('speakStart', req),
        onSpeakEnd: (resp) => emit('speakEnd', resp),
        onError: (err) => emit('error', err),
        onModeChange: (mode) => emit('modeChange', mode),
        onUserInput: (msg) => emit('userInput', msg),
      });
    });

    onBeforeUnmount(() => {
      instance.value?.destroy();
      instance.value = null;
    });

    // 把 AvatarInstance 全部方法透出给父组件 ref
    expose({
      speak: (text: string) => instance.value?.speak(text),
      lipsync: (audio: File | Blob, text?: string) => instance.value?.lipsync(audio, text),
      replyText: (text: string) => instance.value?.replyText(text),
      replyAudio: (text: string, audioUrl: string) => instance.value?.replyAudio(text, audioUrl),
      setLoading: (loading: boolean) => instance.value?.setLoading(loading),
      expand: () => instance.value?.expand(),
      collapse: () => instance.value?.collapse(),
      toggle: () => instance.value?.toggle(),
      reloadConfig: () => instance.value?.reloadConfig(),
      sendMessage: (text: string) => instance.value?.sendMessage(text),
    });

    // 不渲染任何 DOM —— SDK 自己在 body 上挂气泡 + iframe
    return () => null;
  },
});

export default AIAvatar;
export type { AvatarInstance } from '../../../sdk/src/types';
