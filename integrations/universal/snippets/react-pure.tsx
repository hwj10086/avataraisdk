/**
 * AI Avatar — Pure React embed (no @ai-avatar/embed-sdk npm dependency)
 *
 * Use when:
 *   - You don't want to add another npm dependency
 *   - You need full control over script load timing
 *   - You're on an old project (Webpack 4 / no ESM support)
 *
 * If you can install the npm package, prefer @ai-avatar/embed-sdk/react — it's less work.
 */

import { useEffect, useRef } from 'react';

// Teach TypeScript about the <ai-avatar> Web Component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ai-avatar': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          token?: string;
          'agent-id'?: string;
          position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
          theme?: 'light' | 'dark' | 'auto';
          'primary-color'?: string;
          size?: 'compact' | 'normal' | 'large';
          locale?: string;
          greeting?: string;
          'auto-open'?: boolean | '';
        },
        HTMLElement
      >;
    }
  }
}

const SDK_URL = 'https://embed.avataraisdk.com/widget.iife.js';

/**
 * Inject the SDK script into <head> — idempotent, prevents duplicates
 */
function ensureSDKLoaded(): void {
  if (document.querySelector(`script[src="${SDK_URL}"]`)) return;
  const script = document.createElement('script');
  script.src = SDK_URL;
  script.async = true;
  document.head.appendChild(script);
}

interface AIAvatarProps {
  token: string;
  agentId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  greeting?: string;
}

export function AIAvatar(props: AIAvatarProps) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    ensureSDKLoaded();
  }, []);

  return (
    <ai-avatar
      token={props.token}
      agent-id={props.agentId}
      position={props.position ?? 'bottom-right'}
      theme={props.theme ?? 'light'}
      primary-color={props.primaryColor ?? '#6366F1'}
      greeting={props.greeting}
    />
  );
}

// ============================================================
// Usage example
// ============================================================
//
// import { AIAvatar } from './AIAvatar';
//
// function App() {
//   return (
//     <>
//       <YourPageContent />
//       <AIAvatar
//         token={import.meta.env.VITE_AI_AVATAR_TOKEN}
//         agentId={import.meta.env.VITE_AI_AVATAR_AGENT_ID}
//         greeting="Hi! How can I help?"
//       />
//     </>
//   );
// }
