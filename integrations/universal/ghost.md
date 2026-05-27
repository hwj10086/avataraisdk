# Ghost Integration Guide

[← Back to index](./README.md)

## Compatibility

- ✅ Works with Ghost 4.x and 5.x
- ✅ **Free on self-hosted**, works on any Ghost(Pro) plan
- ✅ Code Injection is a core Ghost feature — unlike Squarespace, there's no tier gating

## Prerequisites

[The three setup steps from the index](./README.md#prerequisites-all-platforms).

When testing, add your Ghost domain to the allowlist:
```
https://yourdomain.com
```

---

## Integration steps

### 1. Open Code Injection

Ghost Admin → **Settings** (gear) → **Code injection**

> Path: `https://your-ghost.com/ghost/#/settings/code-injection`

### 2. Paste into Site Footer

In the `Site Footer` box, paste:

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar token="sk-your-key" agent-id="agent_your-id"></ai-avatar>
```

### 3. Save

Click **Save** at the top right. Live immediately.

### 4. Verify

Reload the home page or any post → purple bubble in the bottom-right → no red errors in F12.

---

## Per-page control

Ghost has **two levels** of Code Injection:

### Site-level (all pages)

`Settings → Code injection → Site Footer` — what we used above.

### Post-level (single post)

1. Edit a post → gear icon top right (Post settings)
2. Scroll to the bottom: **Code injection → Post footer**
3. Paste the embed code — only this single post will show the avatar

### Hide by content type using Ghost "Tags"

Ghost lets you tag posts and target them from code. Update the Site Footer to:

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<script>
  // Ghost adds classes like tag-xxx on the body
  // For example, posts tagged "no-avatar" should not show it
  if (!document.body.classList.contains('tag-no-avatar')) {
    const el = document.createElement('ai-avatar');
    el.setAttribute('token', 'sk-your-key');
    el.setAttribute('agent-id', 'agent_your-id');
    document.body.appendChild(el);
  }
</script>
```

---

## Embedding in a Ghost theme (for theme developers)

If you're building your own Ghost theme, drop it in `default.hbs` right before `</body>`:

```handlebars
{{!-- AI Avatar widget --}}
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="{{@custom.ai_avatar_token}}"
  agent-id="{{@custom.ai_avatar_agent_id}}"
></ai-avatar>

{{ghost_foot}}
```

Then declare in `package.json` under `config.custom`:

```json
"custom": {
  "ai_avatar_token": {
    "type": "text",
    "default": ""
  },
  "ai_avatar_agent_id": {
    "type": "text",
    "default": ""
  }
}
```

Theme users can now configure these directly in Ghost Admin → Design without touching code.

---

## Troubleshooting

### ❌ Can't find Code Injection

Ghost 5.x moved Code Injection from the top-level menu into Settings. Path: **Settings → Code injection** (no longer a sidebar item).

### ❌ Strict CSP on Ghost blocks the SDK

Self-hosted Ghost ships without CSP by default, but if you added CSP headers via Cloudflare / Nginx, allow:
```
script-src 'self' https://embed.avataraisdk.com;
frame-src https://avatar.avataraisdk.com;
```

### ❌ Doesn't render on AMP posts

AMP doesn't allow arbitrary JS. This widget is incompatible with AMP posts. You can disable AMP under Ghost Admin → Settings → Labs.

---

## Full example

```html
<!-- Settings → Code injection → Site Footer -->
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="sk-..."
  agent-id="agent_..."
  position="bottom-right"
  theme="auto"
  greeting="Ask me anything about my posts!"
></ai-avatar>
```
