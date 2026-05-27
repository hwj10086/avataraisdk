# Webflow Integration Guide

[← Back to index](./README.md)

## Compatibility

- ✅ Any Webflow site published to a custom domain
- ⚠️ Requires a **Site Plan** (Basic and up, $14/mo) — `webflow.io` subdomains don't support custom code

## Prerequisites

Complete the [three setup steps from the index](./README.md#prerequisites-all-platforms): API Key + Agent ID + allowlist configured.

⚠️ For Webflow testing, add **both domains** to the allowlist:
- `https://yoursite.webflow.io` (preview domain)
- `https://www.yourdomain.com` (production custom domain)

---

## Integration steps

### 1. Open Project Settings

Webflow Designer → project name in the bottom-left → **Project Settings**

### 2. Find Custom Code

Left sidebar → **Custom Code** (alongside General / Hosting / Forms)

### 3. Paste into Footer Code

Scroll down to the **Footer Code** field, paste:

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar token="sk-your-key" agent-id="agent_your-id"></ai-avatar>
```

> ⚠️ **Footer Code only, not Head Code** — Head Code runs too early and the `<ai-avatar>` custom element isn't registered yet. Footer Code is injected right before `</body>`, which is what you want.

### 4. Save + publish

Click **Save Changes** in the top-right → back to Designer → **Publish** in the top-right → select `Publish to Selected Domains`.

### 5. Verify

Open your production domain (not `.webflow.io`, unless that's also in the allowlist):
- Purple bubble in the bottom-right
- No red errors in F12 → Console

---

## Per-page control

Webflow has no built-in "exclude by page" mechanism. Two workarounds:

### Option A: Show site-wide, **hide specific pages via code**

Update the Footer Code to:

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<script>
  // Skip injection on certain pages, show normally elsewhere
  const HIDE_ON = ['/checkout', '/cart', '/legal/privacy'];
  if (!HIDE_ON.some(path => location.pathname.startsWith(path))) {
    const el = document.createElement('ai-avatar');
    el.setAttribute('token', 'sk-your-key');
    el.setAttribute('agent-id', 'agent_your-id');
    document.body.appendChild(el);
  }
</script>
```

### Option B: **Show on specific pages only**

Skip site-wide Footer Code. Instead, on a specific page:

1. Designer → select the page → settings icon top-right → **Page Settings**
2. Scroll to the bottom: **Custom Code → Inside `</body>` tag**
3. Paste the embed code
4. Only this one page shows the avatar

---

## Troubleshooting

### ❌ Pasted the code, but nothing shows up after publishing

Most common cause: **you didn't actually publish**. "Saved" at the top of Webflow Designer ≠ "Published".
Look at the top-right bar — the green `Published` button needs to be clicked and pointed at the Production domain.

### ❌ `.webflow.io` preview works but custom domain doesn't

You added `.webflow.io` to the allowlist but not the custom domain. Add it in the console.

### ❌ I don't have a Site Plan (free version) — can I use this?

No. Webflow's free plan doesn't allow Custom Code. Two options:
- Upgrade to Site Plan
- Build it yourself with React/Vue + Webflow CMS API for export, then use the [npm package](../../packages/embed-sdk/) to embed

### ❌ Can I paste it inside a Webflow Symbol?

Yes, but the SDK will **load once per page that uses the Symbol** (duplicate loads). Recommended: put it in project-level Footer Code so it loads once.

---

## Full example

```html
<!-- Place in Project Settings → Custom Code → Footer Code -->
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="sk-..."
  agent-id="agent_..."
  position="bottom-right"
  theme="light"
  primary-color="#6366F1"
  greeting="Welcome to my Webflow site!"
></ai-avatar>
```
