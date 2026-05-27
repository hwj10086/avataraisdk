# Changelog

All notable changes to the public SDK, npm package, and platform integrations are documented here. The project loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release of the avataraisdk monorepo: core SDK, npm package, WordPress plugin, Shopify extension, and universal embed guides for Webflow / Squarespace / Ghost / Wix / plain HTML.

## SDK — `sdk.js` / `widget.js` / `embed.html`

### 2026-05-22 — locale wiring + iframe `allow="autoplay"`

- `AvatarConfig.appearance.locale` is now forwarded from host page → SDK → Web Component → iframe, so UI strings inside the iframe follow the host site's language instead of the browser default.
- `<iframe allow="autoplay">` added to fix the "backend responds but no sound" issue caused by cross-origin Permission Policy blocking `audio.play()`.

### 2026-05-21 — `lazyLoad`, runtime `show()`/`hide()`, pixel-precise positioning

- New `appearance.left/right/top/bottom` and `appearance.width/height` for pixel-level positioning that overrides the `position` preset.
- New `behavior.lazyLoad` (default `false`) — skip iframe creation until the host calls `show()`.
- New `AvatarInstance.show()` / `hide()` — independent of `expand()` / `collapse()`.

### 2026-05-21 — `appearance.zIndex` + `appearance.interactive` for Headless

- New `appearance.zIndex` (default `2147483647`) makes the wrapper z-index host-configurable.
- New `appearance.interactive` (default `true`, auto `false` in Headless) sets `pointer-events: none` on the wrapper so the host's own UI underneath stays clickable.

### 2026-05-15 — external LLM mode + Headless soft-switch

- `behavior.llmMode: 'managed' | 'external'` — `'external'` emits a `USER_MESSAGE` postMessage / `onUserInput` callback instead of calling the hosted chat endpoint, so customers can plug in their own LLM and stream the reply back via `replyText()` / `replyAudio()`.
- `appearance.chatPanel: 'visible' | 'hidden'` — Headless mode for customers who want the avatar but render their own chat UI.

## `@ai-avatar/embed-sdk` (npm)

### 0.1.2 — 2026-05-26
- React `<AIAvatar>` and Vue `<AIAvatar>` accept a flat `locale` prop that passes through to `appearance.locale`.

### 0.1.1 — 2026-05-26
- Fixed: package built without `__EMBED_BASE_URL__` define was falling back to `https://localhost:3003`, causing cross-origin errors in customer projects.
- React props changed from nested to flat structure to match the Vue component.

### 0.1.0 — 2026-05-26
- Initial release. Vanilla + React + Vue wrappers around the core SDK, single `tsup` build.

## WordPress plugin

### 1.0.0 — 2026-05-26
- Initial release, ready for wp.org submission.
- Admin settings page (API Key / agent / appearance / behavior, 8 fields).
- `[ai_avatar]` shortcode + site-wide auto-injection toggle.
- `uninstall.php` cleans options on plugin removal.
- i18n: English source + `zh_CN` translation.
- Scripts loaded with `wp_enqueue_script(strategy: 'async', in_footer: true)` for compatibility with caching plugins.
- Brand assets: 128×128 / 256×256 icons + 772×250 / 1544×500 banners.

## Shopify Theme App Extension

### 0.1.0 — 2026-05-26
- Initial release as a **Theme App Extension** (App Embed Block) rather than a traditional embedded Admin app — no OAuth, no Polaris, no Node backend. Review cycle 2–4 weeks instead of 2–3 months.
- `blocks/avatar.liquid` exposes all config (token / agent_id / position / theme / color / size / greeting / auto-open) via `{% schema %}` — merchants configure it from the Theme Editor → App Embeds.
- Locale auto-follows `request.locale.iso_code`.

## Universal embed guides

### 2026-05-26 — Initial guides
- Webflow, Squarespace, Ghost, Wix, plain HTML (GitHub Pages / Netlify / Vercel / Hugo / Astro / Jekyll).
- Reusable snippets: `basic.html` (2-line minimal embed), `react-pure.tsx` (zero-dependency React wrapper).
