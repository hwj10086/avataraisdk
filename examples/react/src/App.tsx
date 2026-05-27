import { useRef } from 'react';
import { AIAvatar, type AvatarRef } from '@ai-avatar/embed-sdk/react';

export default function App() {
  const avatarRef = useRef<AvatarRef>(null);

  return (
    <main style={{ maxWidth: 720, margin: '48px auto', padding: '0 24px', fontFamily: 'system-ui' }}>
      <h1>avataraisdk · React example</h1>
      <p>Click below — the avatar widget will appear bottom-right and speak.</p>
      <button
        onClick={() => avatarRef.current?.speak('Hello from React. Real-time lip sync, three lines of code.')}
        style={{
          padding: '10px 16px',
          background: '#7C3AED',
          color: 'white',
          border: 0,
          borderRadius: 8,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Make the avatar speak
      </button>

      <AIAvatar
        ref={avatarRef}
        token="YOUR_API_KEY"
        agentId="YOUR_AGENT_ID"
        position="bottom-right"
        theme="light"
      />
    </main>
  );
}
