<script setup lang="ts">
import { ref } from 'vue';
import { AIAvatar } from '@ai-avatar/embed-sdk/vue';

const avatarRef = ref<InstanceType<typeof AIAvatar> | null>(null);

function speak() {
  avatarRef.value?.speak('Hello from Vue. Real-time lip sync, three lines of code.');
}
</script>

<template>
  <main>
    <h1>avataraisdk · Vue example</h1>
    <p>Click below — the avatar widget will appear bottom-right and speak.</p>
    <button @click="speak">Make the avatar speak</button>

    <AIAvatar
      ref="avatarRef"
      token="YOUR_API_KEY"
      agent-id="YOUR_AGENT_ID"
      position="bottom-right"
      theme="light"
    />
  </main>
</template>

<style>
main { max-width: 720px; margin: 48px auto; padding: 0 24px; font-family: system-ui; }
button {
  padding: 10px 16px;
  background: #7C3AED;
  color: white;
  border: 0;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
button:hover { background: #6D28D9; }
</style>
