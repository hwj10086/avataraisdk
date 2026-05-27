# @ai-avatar/embed-sdk

[![npm version](https://img.shields.io/npm/v/@ai-avatar/embed-sdk.svg)](https://www.npmjs.com/package/@ai-avatar/embed-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Embed the [AI Avatar](https://avataraisdk.com) 3D digital human into your **React / Vue / vanilla JS** website.

Voice chat, real-time lip sync, customizable appearance. 3 lines of code.

## Prerequisites

1. Sign up at [https://avataraisdk.com](https://avataraisdk.com)
2. Console → API Keys → generate a key in `sk-...` format
3. **Console → Origin allowlist → add your development and production origins**
   ```
   http://localhost:5173    # Vite dev server
   http://localhost:3000    # CRA / Next.js dev server
   https://yourapp.com      # production
   ```
   Origins not on the allowlist are rejected by the backend (403), and the avatar fails silently.

## Install

```bash
npm install @ai-avatar/embed-sdk
# or
pnpm add @ai-avatar/embed-sdk
# or
yarn add @ai-avatar/embed-sdk
```

## React

```jsx
import { AIAvatar } from '@ai-avatar/embed-sdk/react';

export default function App() {
  return (
    <>
      <YourPageContent />
      <AIAvatar
        token="sk-..."
        agentId="agent_..."
        position="bottom-right"
        theme="light"
      />
    </>
  );
}
```

### Imperative control via ref

```jsx
import { useRef } from 'react';
import { AIAvatar, type AvatarInstance } from '@ai-avatar/embed-sdk/react';

export default function App() {
  const avatarRef = useRef<AvatarInstance>(null);

  return (
    <>
      <button onClick={() => avatarRef.current?.speak('Hi, welcome!')}>
        Make the avatar speak
      </button>
      <AIAvatar ref={avatarRef} token="sk-..." agentId="agent_..." />
    </>
  );
}
```

## Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { AIAvatar } from '@ai-avatar/embed-sdk/vue';

const avatarRef = ref();
const greet = () => avatarRef.value?.speak('Hi, welcome!');
</script>

<template>
  <button @click="greet">Make the avatar speak</button>
  <AIAvatar
    ref="avatarRef"
    token="sk-..."
    agent-id="agent_..."
    position="bottom-right"
    @ready="() => console.log('avatar ready')"
  />
</template>
```

## Vanilla JS / TypeScript

> Note: the vanilla SDK uses a **nested config** shape (`appearance` / `behavior` / `features`).
> The React / Vue wrappers accept **flat props** and merge them internally — different surface, same thing underneath.

```ts
import { AIAvatar } from '@ai-avatar/embed-sdk';

const avatar = AIAvatar.init({
  token: 'sk-...',
  agentId: 'agent_...',
  appearance: {
    position: 'bottom-right',
    theme: 'light',
    primaryColor: '#6366F1',
    size: 'normal',
  },
  behavior: {
    autoOpen: false,
    greetingMessage: 'Hi, how can I help?',
  },
  features: {
    voiceInput: true,
    voiceOutput: true,
  },
  onReady() {
    console.log('avatar ready');
  },
});

avatar.speak('Hello');
avatar.expand();
```

## Configuration

### Required

| Name | Type | Description |
|---|---|---|
| `token` / `apiKey` | `string` | API Key — generate one in the [Console](https://avataraisdk.com) |
| `agentId` | `string` | Avatar model ID (when omitted, the backend infers it from the token) |

### Appearance

| Name | Type | Default | Description |
|---|---|---|---|
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `bottom-right` | Bubble position |
| `theme` | `'light' \| 'dark' \| 'auto'` | `light` | Theme |
| `primaryColor` | `string` | `#6366F1` | Primary color |
| `size` | `'compact' \| 'normal' \| 'large'` | `normal` | Chat panel size |

### Behavior

| Name | Type | Default | Description |
|---|---|---|---|
| `autoOpen` | `boolean` | `false` | Auto-expand on load |
| `autoOpenDelay` | `number` | `0` | Auto-expand delay (ms) |
| `greeting` | `string` | — | Greeting message |
| `voiceInput` | `boolean` | `true` | Allow microphone input |
| `voiceOutput` | `boolean` | `true` | Enable voice output |

### Advanced

| Name | Type | Description |
|---|---|---|
| `llmMode` | `'managed' \| 'external'` | `managed` (default) routes through our LLM; `external` uses your own LLM — you receive user input via event callbacks |
| `chatPanel` | `'visible' \| 'hidden'` | When `hidden`, only the 3D avatar renders — build your own chat UI |

## Event callbacks

### React

```jsx
<AIAvatar
  token="..."
  onReady={() => console.log('ready')}
  onSpeakStart={(req) => console.log('speak start', req)}
  onSpeakEnd={(resp) => console.log('speak end', resp)}
  onError={(err) => console.error(err)}
  onUserInput={(msg) => console.log('user input', msg)}
/>
```

### Vue

```vue
<AIAvatar
  token="..."
  @ready="onReady"
  @speak-start="onSpeakStart"
  @speak-end="onSpeakEnd"
  @error="onError"
  @user-input="onUserInput"
/>
```

## Imperative API

The instance obtained via ref exposes:

| Method | Purpose |
|---|---|
| `speak(text)` | Make the avatar speak a string (TTS) |
| `lipsync(audio, text?)` | Lip-sync to a pre-rendered audio clip |
| `replyText(text)` | external mode: text reply |
| `replyAudio(text, url)` | external mode: reply with your own audio |
| `expand()` / `collapse()` / `toggle()` | Open / close the chat panel |
| `sendMessage(text)` | Send a message on the user's behalf |
| `setLoading(loading)` | Show / hide the typing indicator |
| `reloadConfig()` | Reload configuration |

## Type-only imports

```ts
import type { AvatarConfig, AvatarInstance } from '@ai-avatar/embed-sdk/types';
```

## Browser support

Works in all modern browsers (Chrome / Edge / Firefox / Safari 14+).
Requires WebGL, `postMessage`, and `<iframe allow="microphone">`.

## License

MIT
