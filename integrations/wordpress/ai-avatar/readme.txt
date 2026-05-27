=== AI Avatar — 3D Digital Human (Demo Chat & SDK) ===
Contributors: yujitech
Tags: ai chatbot, avatar, 3d, voice chat, customer service
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

3D digital human for your site. Demo chat for fast eval; plug in your own LLM (OpenAI, Claude, custom) via the JavaScript SDK.

== Description ==

Most WordPress AI chatbots are text boxes. **AI Avatar gives your visitors a real 3D digital human** they can talk to with voice — the avatar lip-syncs in real time and replies with natural-sounding speech.

= Two ways to use =

* **Demo mode** (this plugin's default) — Quick evaluation with our hosted demo LLM. Paste the API Key, the chat bubble shows up. No coding required. Ideal for evaluating the 3D avatar quality and the conversation UX.
* **Production mode** — Plug in your own LLM (OpenAI, Claude, internal API) via our [JavaScript SDK](https://www.npmjs.com/package/@ai-avatar/embed-sdk) in `external` mode. You keep full control over the conversation logic and data flow; the plugin / SDK only handles the 3D avatar rendering, lip-sync, and voice I/O.

Most production deployments use **Production mode** so visitor messages never touch our LLM and stay within your existing chat / support stack. The plugin's bundled chat exists for fast first-impression demos.

= Why a 3D avatar? =

* **More engaging than text** — visitors talk longer, ask more questions, convert better
* **Voice in / voice out** — natural conversation, not typing
* **Real-time lip-sync** — the avatar's mouth matches the speech, not a cheap GIF
* **Drop-in** — one API Key in settings, the bubble shows up in 3 minutes

= Features =

* One-click embed via WordPress admin — no code editing
* Configurable position (4 corners), theme (light/dark/auto), primary color, size
* `[ai_avatar]` shortcode for per-page placement
* Site-wide auto-inject with per-page exclusion list
* Auto-detects WordPress site language — UI follows your site's locale
* Bundled English + Simplified Chinese translations
* Async script loading — does not slow down your site
* No tracking, no admin nags, no "Upgrade to Pro" popups

= How it works =

1. Install and activate the plugin
2. Sign up at [avataraisdk.com](https://avataraisdk.com) and create an avatar
3. Paste your API Key into **Settings → AI Avatar**
4. Done — the chat bubble appears in the corner of your site

= Pricing =

The plugin is free and open source (GPLv2). The AI Avatar service has a free tier; paid plans scale with conversation volume. See [pricing](https://avataraisdk.com/pricing).

== External services ==

This plugin connects to **AI Avatar** (third-party SaaS) to render the 3D digital human and process conversations. When the chat widget is shown on your site:

**Service: AI Avatar SDK (CDN)**

* Endpoint: `https://embed.avataraisdk.com/widget.iife.js`
* Purpose: loads the JavaScript bundle that renders the 3D avatar
* What is sent: standard HTTP request only — no personal data
* When: on every frontend page where the avatar is configured to display

**Service: AI Avatar API**

* Endpoint: `https://avataraisdk.com/api/v1/*` and `https://avatar.avataraisdk.com`
* Purpose: validates your API Key, processes visitor messages, returns AI text + TTS audio + lip-sync blendshapes
* What is sent: visitor chat messages (text and optional voice input), your API Key, originating IP, the page URL the widget is loaded on
* When: each time a visitor interacts with the chat widget

By using this plugin, your visitors' chat interactions are processed by AI Avatar's servers.

Service Terms of Service: [https://avataraisdk.com/terms](https://avataraisdk.com/terms)
Privacy Policy: [https://avataraisdk.com/privacy](https://avataraisdk.com/privacy)

== Privacy ==

This plugin does **not** store any visitor data in your WordPress database. Plugin settings (API Key, appearance preferences) are stored in the `wp_options` table only.

For GDPR / CCPA compliance, inform your visitors in your site's privacy policy that messages typed or spoken into the chat widget are processed by AI Avatar's third-party servers (see **External services** above).

== Installation ==

1. Upload the `ai-avatar` folder to `/wp-content/plugins/`, or search "AI Avatar" in **Plugins → Add New**
2. Activate the plugin
3. Go to **Settings → AI Avatar** and enter your API Key (sign up free at [avataraisdk.com](https://avataraisdk.com))
4. Add your site's domain to the API Key's allowed-origin whitelist in the AI Avatar console (one-time setup)
5. Visit your site's frontend — the chat bubble should appear in the bottom-right corner

== Frequently Asked Questions ==

= Can I use my own LLM (OpenAI, Claude, internal API)? =

Yes — and that's the recommended path for production. The bundled chat in this plugin uses our hosted demo LLM to let you try the 3D avatar in minutes, but for real deployments you should switch to the JavaScript SDK in `external` mode:

1. `npm install @ai-avatar/embed-sdk`
2. Render the avatar with `<AIAvatar token="..." llmMode="external" chatPanel="hidden" />` (React/Vue) or `AIAvatar.init({ behavior: { llmMode: 'external' } })` (vanilla JS)
3. Listen for the `userInput` event → call your LLM → reply with `avatar.replyText(text)` or `avatar.replyAudio(text, audioUrl)`

This way visitor messages stay in your stack and only the rendered text / audio is sent to AI Avatar for TTS + lip-sync. Full guide: [https://www.npmjs.com/package/@ai-avatar/embed-sdk](https://www.npmjs.com/package/@ai-avatar/embed-sdk).

= The avatar isn't showing on my site — what now? =

Check three things:

1. Is the API Key entered correctly in **Settings → AI Avatar**?
2. Is your domain added to the API Key's allowed-origin whitelist in the AI Avatar console?
3. Open the browser console (F12) — any red errors? Common: `Origin not in whitelist` (fix in console), `Missing apiKey` (re-paste key).

= Can I show the avatar only on specific pages? =

Yes. Uncheck "Site-wide auto-inject" in settings, then add the `[ai_avatar]` shortcode to any post or page where you want the avatar.

= What shortcode attributes are supported? =

`[ai_avatar position="bottom-left" theme="dark"]` — overrides global settings for that placement.

= Will this slow down my site? =

No. The SDK is enqueued with `async` strategy and only loaded on pages where the avatar is shown. 3D assets are loaded on demand when the visitor opens the chat.

= What languages does the chat UI support? =

English and Simplified Chinese out of the box. The widget auto-detects your WordPress site language and follows it. Adding more locales requires translation files (PRs welcome).

= Does this work with caching plugins? =

Yes. The SDK is registered via `wp_enqueue_script`, so it works with WP Rocket, W3 Total Cache, LiteSpeed Cache, and CDN providers. No cache exclusion needed.

= What gets deleted when I uninstall? =

Only the plugin's own settings option (`ai_avatar_settings`). Your AI Avatar account and conversation data on the AI Avatar service remain — manage those at [avataraisdk.com](https://avataraisdk.com).

= Is this plugin GPL? =

Yes. The plugin itself is GPLv2 or later. The AI Avatar service it connects to is a separate SaaS with its own terms.

== Screenshots ==

1. The 3D avatar appears as a chat bubble on the frontend — visitors can text or voice-chat with it
2. Plugin settings page in the WordPress admin — API Key, appearance, behavior all configurable
3. Use the `[ai_avatar]` shortcode in any post or page for per-page placement

== Changelog ==

= 1.0.0 =
* Initial release
* Site-wide auto-inject + `[ai_avatar]` shortcode embedding
* 4 positions, 3 themes, custom primary color and size
* Page exclusion list
* Auto-detects WordPress site language
* English + Simplified Chinese translations bundled
* Standards-compliant `wp_enqueue_script` loading

== Upgrade Notice ==

= 1.0.0 =
Initial release.
