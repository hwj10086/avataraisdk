# Wix Integration Guide (paste-code, no App)

[← Back to index](./README.md)

> This doc covers the **paste-custom-code** approach, no Wix App install required. 100x simpler than shipping a Wix Marketplace App — good for individuals or small teams.
> Once AI Avatar lands on the Wix App Market, your customers will get one-click install like a WordPress plugin.

## Compatibility

- ✅ Wix Editor / Wix Studio / Editor X all work
- ⚠️ **Requires a Premium Plan** (starts at $16/mo "Light") — Wix free tier blocks Custom Code, and the `wix.com/yoursite` subdomain isn't treated as a standalone site
- ⚠️ Must **Connect to a domain** (you can only enable Custom Code after attaching a custom domain)

## Prerequisites

[The three setup steps from the index](./README.md#prerequisites-all-platforms).

⚠️ Wix testing is a little fiddly — **add 2 domains to the allowlist**:
- `https://editor.wix.com` (preview mode)
- `https://www.yourdomain.com` (published site)

---

## Integration steps

### 1. Open Custom Code settings

Wix Dashboard → **Settings** → **Custom Code**

> The path varies slightly between versions. You can also search: Dashboard → top search bar → "custom code".

### 2. Add new code

Click **+ Add Custom Code**.

Fill in:
| Field | Value |
|---|---|
| **Paste the code snippet** | the code below |
| **Name** | `AI Avatar` |
| **Add Code to Pages** | `All pages` |
| **Place Code in** | **Body - end** (important! not Head) |
| **Load code on each new page** | ✅ checked |

Code:

```html
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar token="sk-your-key" agent-id="agent_your-id"></ai-avatar>
```

### 3. Apply + Publish

Click **Apply**, then **Publish** at the top of Wix.

### 4. Verify

Open the **published** custom domain (not the Editor preview). The purple bubble should appear in the bottom-right.

---

## Per-page control

Wix's Custom Code panel supports page targeting:

### Specific pages only

In step 2, set `Add Code to Pages` to **Choose specific pages** and check the pages you want.

### Exclude specific pages

Wix has no native "exclude" option. Use [Webflow's Option A](./webflow.md#option-a-show-site-wide-hide-specific-pages-via-code) instead — same code, pasted into Custom Code.

---

## Integrating via Velo (Wix's JS framework)

If you're already writing Velo code, you can get finer-grained control:

```javascript
// Inside any page's onReady
$w.onReady(function () {
  // Wait for the SDK to load
  const script = document.createElement('script');
  script.src = 'https://embed.avataraisdk.com/widget.iife.js';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    const avatar = document.createElement('ai-avatar');
    avatar.setAttribute('token', 'sk-your-key');
    avatar.setAttribute('agent-id', 'agent_your-id');
    document.body.appendChild(avatar);
  };
});
```

⚠️ In Velo mode `$w` elements are sandboxed, but `document` is the normal DOM. The iframe the SDK creates is attached to `<body>` and works as expected.

---

## Troubleshooting

### ❌ "This feature requires a Premium plan"

You're on the free tier. Custom Code is a paid feature. Three options:
- Upgrade to Premium (from $16/mo)
- Build a Velo + custom HTTP function service yourself (not recommended, roundabout)
- Switch platforms

### ❌ Custom Code option is disabled

You need to **Connect to a Domain** first (Settings → Domains). Wix requires a custom domain before Custom Code becomes available.

### ❌ Changed Custom Code but nothing happened

Wix CDN caches things. Wait 1–2 minutes, or go to **Settings → Site Cache → Clear Cache**.

### ❌ Avatar doesn't show in the Editor preview

The Editor's "preview" is a simulated environment and doesn't run Custom Code. **You have to click Publish and check the live domain** to verify.

---

## Full example

```html
<!-- Dashboard → Settings → Custom Code → Add Custom Code → Body - end -->
<script src="https://embed.avataraisdk.com/widget.iife.js" async></script>
<ai-avatar
  token="sk-..."
  agent-id="agent_..."
  position="bottom-right"
  theme="light"
></ai-avatar>
```

---

## Future: official Wix App Market App

In the pipeline. Once it ships on the App Market, Wix users will get **one-click install** like a mobile app — no code, no Premium Plan required.
