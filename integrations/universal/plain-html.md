# Static Site Integration Guide

[← Back to index](./README.md)

> Applies to: any situation where **you can edit the HTML file**. GitHub Pages, Netlify, Vercel, Cloudflare Pages, your own nginx, Apache, even a local `.html` file opened by double-clicking (for dev testing).

## Compatibility

- ✅ Completely free
- ✅ Any static site generator (Hugo / Jekyll / Astro / 11ty / Next.js static export / Nuxt static)
- ✅ Hand-written HTML
- ⚠️ Don't **just double-click the file** when testing (the `file://` protocol gets rejected by the allowlist). Run a local server:
  ```powershell
  npx serve -p 8080
  # or
  python -m http.server 8080
  ```

## Prerequisites

[The three setup steps from the index](./README.md#prerequisites-all-platforms).

Add your actual deployed domain to the allowlist. Add localhost too for local testing:
```
http://localhost:8080
http://localhost:5173
http://localhost:3000
https://yourdomain.com
```

---

## Minimal integration

Add these two lines at the end of any HTML file's `<body>` (just before `</body>`):

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar token="sk-your-key" agent-id="agent_your-id"></ai-avatar>
```

Done. **No step three.**

---

## Full HTML template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Site</title>
</head>
<body>
  <header>
    <h1>Welcome</h1>
  </header>

  <main>
    <!-- Your site content -->
  </main>

  <footer>
    <!-- Footer content -->
  </footer>

  <!-- AI Avatar embed (before </body>) -->
  <script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
  <ai-avatar
    token="sk-..."
    agent-id="agent_..."
    position="bottom-right"
    theme="light"
    primary-color="#6366F1"
    greeting="Hi! Need help?"
  ></ai-avatar>
</body>
</html>
```

---

## Deployment scenarios

### GitHub Pages

Push the HTML above to your `<your-username>.github.io` repo, enable Pages — it just works.
Add `https://<your-username>.github.io` to the allowlist.

### Netlify / Vercel / Cloudflare Pages

Push an `index.html` to a git repo and the platform deploys it automatically.
Add the platform-assigned domain plus any custom domain you've connected to the allowlist.

### Static site generators (Hugo / Jekyll / Astro / 11ty etc.)

Add the embed code before `</body>` in your theme's template. **Add it once** (in the main layout, not in each page).

#### Hugo example

`layouts/partials/footer.html`:
```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="{{ .Site.Params.aiAvatar.token }}"
  agent-id="{{ .Site.Params.aiAvatar.agentId }}"
></ai-avatar>
```

`config.toml`:
```toml
[params.aiAvatar]
token = "sk-..."
agentId = "agent_..."
```

#### Astro example

`src/layouts/Layout.astro`, before `</body>`:
```astro
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token={import.meta.env.PUBLIC_AI_AVATAR_TOKEN}
  agent-id={import.meta.env.PUBLIC_AI_AVATAR_AGENT_ID}
></ai-avatar>
```

`.env`:
```
PUBLIC_AI_AVATAR_TOKEN=sk-...
PUBLIC_AI_AVATAR_AGENT_ID=agent_...
```

#### Jekyll example

`_layouts/default.html`, before `</body>`:
```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="{{ site.ai_avatar.token }}"
  agent-id="{{ site.ai_avatar.agent_id }}"
></ai-avatar>
```

`_config.yml`:
```yaml
ai_avatar:
  token: "sk-..."
  agent_id: "agent_..."
```

### Your own nginx / Apache

Same as everywhere else — add the embed code to the HTML file. **No** nginx/Apache config changes needed.

### Intranet deployments

The avatar needs outbound access to `embed.avataraisdk.com` (SDK), `avatar.avataraisdk.com` (PureJS app), and `avataraisdk.com/api` (chat responses). Your intranet must allow these three domains.

---

## Per-page / per-route control

Completely up to you — paste it on whichever pages you want.

### Show everywhere

Put it in a shared template / partial (`footer.html` / `_layouts/default.html`).

### Show only on specific pages

Paste the embed code in just that one HTML file.

### Show everywhere except certain pages

Use JS to gate it:
```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<script>
  const HIDE_ON = ['/checkout', '/admin', '/legal/privacy'];
  if (!HIDE_ON.some(p => location.pathname.startsWith(p))) {
    const el = document.createElement('ai-avatar');
    el.setAttribute('token', 'sk-...');
    el.setAttribute('agent-id', 'agent_...');
    document.body.appendChild(el);
  }
</script>
```

---

## Troubleshooting

### ❌ `Origin 'null' not in allowlist`

You **double-clicked** the HTML file. The browser origin becomes `null` (or `file://`). **Run a local server**:
```powershell
npx serve -p 8080
# then open http://localhost:8080
```

### ❌ `Cannot use import statement outside of a module`

You're loading `widget.js` (the ES module build). Switch to `widget.iife.js` (IIFE build, loads fine via a regular script tag).

### ❌ A minifier stripped the `<ai-avatar>` tag from the built site

Some aggressive HTML minifiers delete `<ai-avatar>` because it isn't on the HTML5 tag allowlist. Fixes:
- Add the custom tag to the minifier's allowlist
- Or create it dynamically with JS:
  ```js
  const el = document.createElement('ai-avatar');
  el.setAttribute('token', 'sk-...');
  document.body.appendChild(el);
  ```

### ❌ Errors with Next.js / Nuxt / SvelteKit

These are SSR frameworks. **Use the matching npm package** instead of this guide:
- React / Next.js → `@ai-avatar/embed-sdk/react`
- Vue / Nuxt → `@ai-avatar/embed-sdk/vue`
- See [npm package docs](../../packages/embed-sdk/README.md)
