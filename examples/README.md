# Examples

Three minimal runnable examples — pick the one that matches your stack.

| Folder | Stack | How to run |
|---|---|---|
| [`plain-html/`](./plain-html) | Just an HTML file | Open `index.html` in a browser |
| [`react/`](./react) | Vite + React 18 + `@ai-avatar/embed-sdk` | `npm install && npm run dev` |
| [`vue/`](./vue) | Vite + Vue 3 + `@ai-avatar/embed-sdk` | `npm install && npm run dev` |

## Before you run

Each example uses `YOUR_API_KEY` and `YOUR_AGENT_ID` as placeholders. Get real ones:

1. Sign up at [console.avataraisdk.com/register](https://console.avataraisdk.com/register) (free tier, no card).
2. Create an avatar (pick a 3D model + voice).
3. Generate an API key. Add `http://localhost:5173` (Vite default) to the key's domain whitelist.
4. Find the agent ID on the avatar's settings page.

Replace the two placeholders and you're live.

## Adding a new example

Open an issue first to make sure the example fits, then send a PR. See [CONTRIBUTING.md](../CONTRIBUTING.md).
