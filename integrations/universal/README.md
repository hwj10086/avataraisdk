# Universal Embed Guide

> For platforms **without an official plugin marketplace** — Webflow / Squarespace / Ghost / Wix (paste-code method) / any static site.
> If the platform lets you "paste a custom code snippet", this guide will get the AI Avatar embedded.

## Pick your platform

| Platform | Difficulty | Paid plan required | Docs |
|---|---|---|---|
| **Webflow** | ⭐ | Site Plan (Basic and up, $14/mo) | [→ webflow.md](./webflow.md) |
| **Squarespace** | ⭐ | Business Plan ($18/mo) and up | [→ squarespace.md](./squarespace.md) |
| **Ghost** | ⭐ | Free if self-hosted, paid on Ghost(Pro) | [→ ghost.md](./ghost.md) |
| **Wix** (paste-code) | ⭐⭐ | Premium Plan ($16/mo) and up | [→ wix-custom-code.md](./wix-custom-code.md) |
| **Any static site** | ⭐ | Free | [→ plain-html.md](./plain-html.md) |

> WordPress users: use the [official plugin](../wordpress/). React / Vue projects: use the [npm package](../../packages/embed-sdk/). Don't use this guide.

---

## Prerequisites (all platforms)

Regardless of platform, do these three things first:

### 1. Sign up and get an API Key

Go to [https://avataraisdk.com](https://avataraisdk.com) → sign up → console → API Keys → generate a key starting with `sk-...`.

### 2. Create an avatar Agent

Console → Agents → New → pick an avatar model, configure the prompt → grab the ID starting with `agent_...`.

### 3. Add your site's domain to the origin allowlist

Console → API Keys → select your key → Allowed Origins → add:

```
https://yourdomain.com
https://www.yourdomain.com
```

⚠️ **Without the allowlist**: the avatar loads, but messages return 403 and it **fails silently**.

---

## What the embed code looks like

Every platform pastes the same two lines (with variations):

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar token="sk-your-key" agent-id="agent_your-id"></ai-avatar>
```

Full version (with appearance / language / greeting):

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="sk-..."
  agent-id="agent_..."
  position="bottom-right"
  theme="light"
  primary-color="#6366F1"
  size="normal"
  locale="en-US"
  greeting="Hi! How can I help you today?"
></ai-avatar>
```

See [Configuration reference](#configuration-reference) for each attribute.

---

## Configuration reference

### Appearance

| Attribute | Values | Default |
|---|---|---|
| `position` | `bottom-right` / `bottom-left` / `top-right` / `top-left` | `bottom-right` |
| `theme` | `light` / `dark` / `auto` (follow system) | `light` |
| `primary-color` | any hex color, e.g. `#FF6B6B` | `#6366F1` |
| `size` | `compact` / `normal` / `large` | `normal` |
| `locale` | BCP47, e.g. `en-US` / `zh-CN` | auto-detect from browser |

### Behavior

| Attribute | Description |
|---|---|
| `auto-open` | Add this attribute to auto-open the chat panel on page load |
| `greeting="..."` | Custom greeting message |
| `voice-input="false"` | Disable microphone input |
| `voice-output="false"` | Disable voice output |

---

## Troubleshooting (all platforms)

### The avatar doesn't appear

Diagnose in this order:

1. **F12 → Console, look for red errors**
   - `Cannot use import statement outside of a module` → you're using `widget.js` (ES module build); switch to `widget.iife.js`
   - `403 Forbidden` / `Origin not in whitelist` → domain isn't in the allowlist, see [Prerequisites Step 3](#3-add-your-sites-domain-to-the-origin-allowlist)
   - `Missing apiKey parameter` → token is missing or misspelled

2. **F12 → Elements, search for the `<ai-avatar>` tag**
   - Not there → the platform stripped your code; check that platform's docs on "allowing HTML"
   - There but no bubble → most likely the issue is in step 1

3. **Check the `script` request**
   - F12 → Network → refresh → search for `widget.iife.js`
   - Status 200 → SDK loaded fine
   - 404 → URL is wrong
   - Red / blocked → the site's CSP header blocks third-party scripts (rare)

### Site CSS is breaking the avatar styling

Can't happen — the avatar lives in an **iframe**, fully isolated from your site's CSS.

### Show on some pages, hide on others

Varies by platform — see the "per-page control" section in the relevant platform doc.

### Does it work on mobile?

Yes. The chat panel goes fullscreen automatically on mobile. **Microphone permission** on iOS Safari requires a user gesture (the user has to tap the bubble first).

---

## Snippet quick reference

| Use case | Snippet |
|---|---|
| Minimal version (just the avatar) | [snippets/basic.html](./snippets/basic.html) |
| Pure React without npm | [snippets/react-pure.tsx](./snippets/react-pure.tsx) |
| Used alongside Tailwind | [snippets/tailwind-themed.html](./snippets/tailwind-themed.html) |
