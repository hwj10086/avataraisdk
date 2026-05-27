# Squarespace Integration Guide

[← Back to index](./README.md)

## Compatibility

- ✅ Works with Squarespace 7.0 and 7.1
- ⚠️ Requires **Business Plan** ($18/mo) or higher — Personal Plan blocks Code Injection
- ⚠️ Must be published to your custom domain (`.squarespace.com` subdomains work for testing as long as they're in the allowlist)

## Prerequisites

[The three setup steps from the index](./README.md#prerequisites-all-platforms) — API Key + Agent ID + allowlist.

For testing, add to the allowlist:
```
https://yoursite.squarespace.com
https://www.yourdomain.com
```

---

## Integration steps

### 1. Open Code Injection

Squarespace admin → **Settings** → **Advanced** → **Code Injection**

### 2. Paste this into Footer

In the `Footer` field, paste:

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar token="sk-your-key" agent-id="agent_your-id"></ai-avatar>
```

> Again: **Footer only, not Header** — timing issue with custom element registration.

### 3. Save

Click **Save** at the bottom. Squarespace has no separate "publish" step — changes go live immediately.

### 4. Verify

Open your published site (incognito, to avoid cache):
- Purple bubble in the bottom-right ✓
- No red errors in F12 ✓

---

## Per-page control

Squarespace **supports per-page Code Injection**:

### Site-wide (default)

Use Settings → Advanced → Code Injection → Footer.

### Only on specific pages

Skip site-wide. Instead:

1. Select the page → hover for the gear icon → **Page Settings**
2. Switch to the **Advanced** tab
3. Paste into **Page Header Code Injection** (this is per-page, not site-wide)

> Squarespace only offers Header injection per-page (no Footer), but `defer` keeps it non-blocking:
> ```html
> <script src="https://embed.avataraisdk.com/widget.iife.js" defer></script>
> <ai-avatar token="sk-..." agent-id="agent_..."></ai-avatar>
> ```

### Site-wide with exclusions

Use [Webflow's Option A](./webflow.md#option-a-show-site-wide-hide-specific-pages-via-code) — same code, paste into Code Injection → Footer.

---

## Troubleshooting

### ❌ Says "Premium Feature"

You're on Personal Plan. Code Injection requires Business+. Either upgrade or switch platforms.

### ❌ Code Injection missing on Squarespace 7.0 templates

Older templates may show it under **Settings → Code Injection** (no Advanced submenu). Location is slightly different.

### ❌ I pasted and saved, but Squarespace stripped the `<ai-avatar>` tag?

It doesn't strip — Code Injection is injected verbatim. If the tag isn't there, check F12 → Network for SDK load status (should be 200).

### ❌ Want to paste it inside blog posts / product pages

Don't use the **Block editor's** Code Block to paste the whole SDK — every block reloads it. Use **page-level Code Injection** or **site-wide Code Injection** instead.

---

## Full example

```html
<!-- Place in Settings → Advanced → Code Injection → Footer -->
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="sk-..."
  agent-id="agent_..."
  position="bottom-right"
  theme="auto"
  greeting="Hi! Browsing? Ask me anything."
></ai-avatar>
```
