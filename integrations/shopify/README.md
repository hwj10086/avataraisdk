# AI Avatar — Shopify App

> Shopify merchants enable an App Embed Block in the theme editor, paste their API Key, and the avatar appears on the storefront.
> Similar to the WordPress plugin, but built on Shopify's Theme App Extension system.

> **Open-source reference vs. hosted SaaS** — This repository is the open-source Theme App Extension (great for self-hosting, learning the embed contract, or forking before shipping your own Shopify app). For merchants who want one-click install with managed OAuth, updates, and GDPR compliance built in, see our **hosted Shopify app** at [avataraisdk.com](https://www.avataraisdk.com) — currently being prepared for submission to the public Shopify App Store.

## Architecture

**Theme App Extension route, not Embedded App route**:

| Dimension | Theme App Extension (our choice) | Embedded App (traditional, heavy) |
|---|---|---|
| Node backend required | ❌ No | ✅ Yes — must deploy a service |
| OAuth integration | ❌ No | ✅ Required |
| Merchant configuration UI | Theme editor → App Embeds | Custom admin UI in the app (Polaris) |
| Review difficulty | Low | Medium |
| Implementation effort | 1–2 weeks | 1–2 months |

We do a **pure frontend embed** (inject the `<ai-avatar>` tag and SDK into store pages) — no need for OAuth + backend + Polaris UI.

---

## Directory structure

```
ai-avatar/
├── shopify.app.toml                          # App config (name / scopes / client_id, etc.)
├── package.json                              # Minimal Node package for Shopify CLI
├── .gitignore
└── extensions/
    └── ai-avatar-widget/                     # Theme App Extension
        ├── shopify.extension.toml            # Extension metadata
        ├── blocks/
        │   └── avatar.liquid                 # ⭐ Core — App Embed Block implementation
        └── locales/
            ├── en.default.json               # English (default)
            └── zh-CN.json                    # Simplified Chinese
```

**Only one core file**: `blocks/avatar.liquid` — every UI control merchants see in the theme editor (settings / labels / defaults) plus the code injected into the storefront lives here.

---

## Development workflow

### 1. Install Shopify CLI

> Version notes:
> - **Shopify CLI 3.59+** merged `@shopify/app` into `@shopify/cli` — install one package
> - **Shopify CLI 4.0+** requires Node ≥ 22.12; our package.json pins `~3.94.3` to stay compatible with Node 18+
> - Once you upgrade to Node 22, bump it to `^4.0.0`

```powershell
cd integrations/shopify/ai-avatar
npm install      # local install, no global pollution
```

Then use `npx shopify` or `npm run dev` to invoke the CLI.

### 2. Register a Shopify Partners account

[https://partners.shopify.com/signup](https://partners.shopify.com/signup) — free.

### 3. Create a development store

Partners Dashboard → **Stores** → **Add store** → **Development store** → name it.
This is a free test store — you can install your dev app on it without affecting real merchants.

### 4. Link the local app to your Partners account

```powershell
cd integrations/shopify/ai-avatar
shopify app config link
```

Opens an OAuth flow in the browser — sign in, pick which Partner account to link this local project to, and a `client_id` is automatically written back to `shopify.app.toml`.

### 5. Start the local dev server

```powershell
shopify app dev
```

This will:
- Start an ngrok tunnel (so Shopify can reach localhost)
- Print an install link like `https://xxx.myshopify.com/admin/apps/...`
- Click the link → installs into your dev store

### 6. Enable the App Embed in your dev store

1. Dev store admin → **Online Store** → **Themes** → **Customize**
2. Top-left dropdown → switch to **App embeds**
3. Find **AI Avatar** → **toggle it on**
4. Fill in API Key, Agent ID, appearance, etc.
5. Top-right **Save**
6. Visit the storefront → the avatar bubble should appear in the bottom-right corner

### 7. Deploy to Partners (so real merchants can install)

```powershell
shopify app deploy
```

Pushes the current version to Partners — this is what merchants pull when they install from the App Store.

---

## App Store submission

### 1. Submit a listing in the Partners Dashboard

You'll need:
- App icon (1024×1024 PNG)
- At least 3 screenshots (1600×900)
- App description (English first)
- Privacy policy / Terms links (heads up: Shopify also requires these)
- Demo video (optional but strongly recommended)
- Support email

### 2. Submit for review

Shopify's review process is stricter than WordPress's:
- **2–4 weeks** of human review
- Reviewers often respond asking for changes (performance / UI / copy / privacy disclosure)
- Address the feedback and resubmit
- Once approved → live on the App Store globally

### 3. Billing

If you charge, Shopify takes 15–20%. We're free in v1 (the SaaS side charges), and the Shopify App itself is free — easier to pass review.

---

## Comparison with the WordPress plugin

| Item | WordPress | Shopify |
|---|---|---|
| Main code file | `ai-avatar.php` (~400 lines of PHP) | `avatar.liquid` (~100 lines of Liquid + JSON schema) |
| Config UI | Hand-written PHP settings page | Auto-rendered by the Shopify theme editor (just declare a schema) |
| i18n | `__()` + `.po/.mo` | locales/`*.json` |
| Auto-load SDK | `wp_enqueue_script` | `<script src>` directly in Liquid |
| Review window | 1–4 weeks | 2–4 weeks |
| Customer type | All kinds of site owners | Mostly ecommerce — **highest willingness to pay** |

---

## Troubleshooting

### Q: Tethering to ngrok during development is annoying — any alternative?

`shopify app dev` manages ngrok for you automatically (actually Cloudflare Tunnel under the hood) — no need to start it yourself. Stop the dev server and the tunnel closes too.

### Q: A merchant installed the app but no bubble shows on the storefront

Check three things:
1. Did the merchant actually **enable the App Embed toggle** in the theme editor (it's off by default)?
2. Did the merchant fill in the API Key?
3. Is the merchant's myshopify.com domain on the AI Avatar console origin allowlist?

### Q: Theme App Extension vs Theme Block — what's the difference?

- **App Embed Block** (what we use) — site-wide; merchants toggle and configure it under App embeds
- **App Block** — merchants **drag it into a section** (e.g. a product page) — good for localized features like "product-page Q&A"
- **Theme Block** — used when selling themes directly; different category from Apps

### Q: Can we avoid making merchants paste an API Key manually?

Yes, but it requires OAuth + a backend:
1. Merchant installs the app → OAuth authorization
2. Your backend calls the AI Avatar console API to auto-provision an account + key for the merchant
3. Store the key in a shop metafield via Shopify's Metafield API
4. Read it from Liquid as `{{ shop.metafields.ai_avatar.api_key }}`

That's the v2 direction. v1 stays simple — merchants register and paste their own key.

---

## Get started now

1. **Register on [Shopify Partners](https://partners.shopify.com/signup)** (5 minutes)
2. **Create a development store** (2 minutes)
3. **Install the CLI locally and run dev**:
   ```powershell
   cd integrations/shopify/ai-avatar
   npm install
   npm run config:link    # link to Partners
   npm run dev            # start dev server
   ```
4. Install it on the dev store and test from the theme editor

---

## Pre-submission TODO

- [ ] Run `shopify app dev` end-to-end — from theme editor toggle to bubble on the storefront
- [ ] Prepare listing imagery (reuse the WordPress icons if you like, but Shopify needs 1024×1024)
- [ ] Update Privacy / Terms on avataraisdk.com to cover Shopify merchants (how merchant data and visitor conversations are handled)
- [ ] Record a 30–60 second demo video (strongly recommended — Shopify reviewers like to watch)
- [ ] Write App Store copy (150-character short description + long description, English first)
