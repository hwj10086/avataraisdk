<div align="center">

<img src="./assets/logo.svg" alt="avataraisdk" width="120" />

# avataraisdk

**Drop-in 3D AI avatars for any website.**
Real-time lip-sync, multi-language voices, three lines of code.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Website](https://img.shields.io/badge/website-avataraisdk.com-black)](https://www.avataraisdk.com)
[![WordPress Plugin](https://img.shields.io/badge/WordPress-plugin-21759B?logo=wordpress&logoColor=white)](./integrations/wordpress)
[![Shopify App](https://img.shields.io/badge/Shopify-extension-96BF48?logo=shopify&logoColor=white)](./integrations/shopify)

[**Live Demo**](https://www.avataraisdk.com) · [**Sign Up Free**](https://console.avataraisdk.com/register) · [**Documentation**](https://docs.avataraisdk.com)

</div>

---

<p align="center">
  <img src="./assets/demo.gif" alt="avataraisdk demo" width="360" />
</p>

## What it does

avataraisdk lets you embed an interactive 3D avatar on any web page in minutes. The avatar speaks with a natural voice, moves its lips in sync with the audio, and can be triggered by your own text or audio input. No 3D engine, no animation pipeline, no model files to ship — just a `<script>` tag.

## Why avataraisdk

- **3D avatars that actually talk** — Real-time lip-sync driven by 52 ARKit blendshapes, not pre-rendered video loops
- **Three integration paths** — JS SDK, Web Component, or iframe. Pick what fits your stack
- **Bring your own audio (or use ours)** — Send plain text and we synthesize voice + lip-sync; or upload your own audio file and we generate just the lip-sync
- **Production-ready by default** — Domain whitelisting per API key, monthly quotas, usage analytics, audit logs
- **Multi-language** — Console available in 8 languages, voice library covers Chinese · English · Japanese and more

## Quick start

Add four lines to any HTML page:

```html
<script type="module" src="https://embed.avataraisdk.com/sdk.js"></script>
<script type="module">
  AIAvatar.init({ agentId: 'agent_xxx', apiKey: 'sk-xxx' });
</script>
```

The avatar appears as a floating bubble. Click it to open, send text, watch it speak.

Prefer a declarative HTML tag? Use the Web Component:

```html
<script type="module" src="https://embed.avataraisdk.com/widget.js"></script>
<ai-avatar agent-id="agent_xxx" api-key="sk-xxx"></ai-avatar>
```

Get your `agent-id` and `api-key` from the [console](https://console.avataraisdk.com). For an iframe-only integration (no JavaScript at all on your page), use the [in-console code generator](https://console.avataraisdk.com/integration) — it produces a copy-paste `<iframe>` tag for you.

## What's in this repo

This repository hosts the **open-source SDK and platform integrations** for the avataraisdk hosted service. The rendering pipeline, billing, and admin console remain proprietary.

| Path | What it is |
|---|---|
| [`sdk/`](./sdk) | Core embed SDK — `sdk.js` / `widget.js` / `embed.html` built from one source. Vite library mode, three entry points. |
| [`packages/embed-sdk/`](./packages/embed-sdk) | The `@ai-avatar/embed-sdk` npm package — vanilla + React + Vue wrappers over the core SDK. |
| [`integrations/wordpress/`](./integrations/wordpress) | The official WordPress plugin (GPLv2+, distributed on wp.org). |
| [`integrations/shopify/`](./integrations/shopify) | Shopify Theme App Extension (one-click install in any Shopify theme). |
| [`integrations/universal/`](./integrations/universal) | Copy-paste guides for Webflow, Squarespace, Ghost, Wix, plain HTML, Jekyll, Astro, Hugo, etc. |
| [`examples/`](./examples) | Minimal runnable examples — plain HTML, React, Vue. |

## Features

| | |
|---|---|
| **3D avatar library** | Curated public 3D models, or upload your own ReadyPlayerMe character |
| **Voice library** | Multi-language neural TTS, female / male / child variants, in-console preview |
| **Real-time lip-sync** | 52 ARKit blendshape stream synced to audio playback |
| **Two modes** | **A**) Text → TTS + lip-sync &nbsp;&nbsp; **B**) Audio file → lip-sync only |
| **Origin allowlist** | Lock each API key to specific domains. Stolen keys can't be used elsewhere |
| **Free during beta** | All features free while in beta — no credit card required |
| **Real-time analytics** | Per-key usage logs, monthly trends, 14-day charts |
| **Internationalization** | Console UI in 8 languages out of the box |

## Three ways to embed

Pick the integration that fits your stack.

### 1. JS SDK — for apps that need programmatic control

Best for SPAs and apps where you want to trigger speech, listen for events, or control the avatar from code.

```html
<script type="module" src="https://embed.avataraisdk.com/sdk.js"></script>
<script type="module">
  const widget = AIAvatar.init({
    agentId: 'agent_xxx',
    apiKey: 'sk-xxx',
    appearance: { theme: 'light', primaryColor: '#6366F1' },
    behavior: { autoOpen: false },
  });

  // Drive it from your code
  widget.speak('Welcome to our platform.');
</script>
```

### 2. Web Component — for declarative HTML

Best for Vue / React / Svelte / plain HTML, where you'd rather use an HTML tag than write JS.

```html
<script type="module" src="https://embed.avataraisdk.com/widget.js"></script>
<ai-avatar
  agent-id="agent_xxx"
  api-key="sk-xxx"
  theme="light"
  primary-color="#6366F1"
  position="bottom-right"
></ai-avatar>
```

### 3. iframe — zero JavaScript

Best for static sites, CMS-managed pages, or anywhere you can't run custom JS. The iframe `src` needs a base64url-encoded config blob, so the easiest path is to **generate the snippet in the [console integration page](https://console.avataraisdk.com/integration)** — pick your appearance + behavior options, copy the produced `<iframe>` tag, paste into your site. The generated snippet looks like:

```html
<iframe
  src="https://avatar.avataraisdk.com/?config=eyJhZ2VudElkIjoi..."
  style="position: fixed; bottom: 16px; right: 16px; width: 96px; height: 96px; border: 0; border-radius: 50%; z-index: 2147483647; background: transparent;"
  allow="autoplay; microphone"
  allowtransparency="true"
></iframe>
```

> See [`integrations/`](./integrations) for first-class plugins (WordPress, Shopify) and copy-paste guides for Webflow / Squarespace / Ghost / Wix / plain HTML.

## Use cases

- **SaaS onboarding** — Replace static product tours with a friendly avatar walkthrough
- **E-commerce** — Product demo videos that explain specs and answer questions
- **Education** — Interactive AI tutor for online courses and language learning
- **Customer support** — First-line FAQ assistant before escalating to a human agent
- **Brand assistants** — Bring your brand mascot to life on the homepage

## Get started in 5 minutes

1. **[Sign up](https://console.avataraisdk.com/register)** — free, no credit card required
2. **Create an avatar** — pick a 3D model and a voice from the library
3. **Generate an API key** — bind it to your domain allowlist
4. **Copy the embed code** — paste it into your site, you're live

> **Free during beta.** avataraisdk is currently free for all users while in beta. Pricing will be announced before any plan limits are introduced — existing users will be notified ahead of time.

## Resources

- [Live demo](https://www.avataraisdk.com)
- [Console](https://console.avataraisdk.com)
- [Documentation](https://docs.avataraisdk.com)
- [API reference](https://docs.avataraisdk.com/api)
- [Changelog](./CHANGELOG.md)

## Contributing

Bug reports, PRs and platform-integration contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow, and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community standards.

## Support

- **Bug?** [Open an issue](https://github.com/hwj10086/avataraisdk/issues/new/choose)
- **Feature request?** [Start a discussion](https://github.com/hwj10086/avataraisdk/discussions)
- **Security disclosure** see [SECURITY.md](./SECURITY.md)
- **Email** hello@avataraisdk.com

## License

The example code, SDK, and most integrations in this repository are [MIT-licensed](./LICENSE).
The WordPress plugin in [`integrations/wordpress/`](./integrations/wordpress) is licensed under [GPLv2 or later](./integrations/wordpress/ai-avatar/LICENSE) as required by wp.org.
The avataraisdk hosted service is governed by our [Terms of Service](https://www.avataraisdk.com/terms) and [Privacy Policy](https://www.avataraisdk.com/privacy).

---

<div align="center">

[Website](https://www.avataraisdk.com) · [Console](https://console.avataraisdk.com) · [Docs](https://docs.avataraisdk.com)

</div>
