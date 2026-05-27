# AI Avatar — WordPress Plugin

## Directory structure

```
ai-avatar/
├── ai-avatar.php         # Main file — settings page, shortcode, auto-inject
├── uninstall.php         # Clean up options on uninstall
├── readme.txt            # WordPress directory metadata (NOT markdown!)
└── assets/               # Icons and screenshots
    ├── icon-128x128.png       (generated)
    ├── icon-256x256.png       (generated)
    ├── icon.svg               (vector, also accepted by the WP directory)
    ├── banner-772x250.png     (generated)
    ├── banner-1544x500.png    (generated)
    ├── screenshot-1.png       (frontend chat in action)
    ├── screenshot-2.png       (admin settings page)
    ├── screenshot-3.png       (shortcode usage example)
    └── source/                → SVG sources + conversion script (re-run after design changes to regenerate PNGs)
        ├── icon.svg
        ├── banner-772x250.svg
        └── build-png.mjs
```

## Local testing

### 1. Install a local WordPress

Download [Local](https://localwp.com/) → create a new site → open admin.

### 2. Install this plugin

Copy the entire `ai-avatar/` folder to:
```
<Local site path>/app/public/wp-content/plugins/
```

> In Local, each site has a "Go to site folder" button that opens the directory.

### 3. Activate and configure

1. WordPress admin → Plugins → activate "AI Avatar"
2. Settings → AI Avatar
3. Enter your API Key (get one from the https://avataraisdk.com console)
4. In the console, add `http://<local domain>` to the API Key's origin allowlist
5. Save, visit the homepage — the avatar should appear in the bottom-right corner

### 4. Test the shortcode

Add `[ai_avatar]` to any post — the avatar will render on that post specifically (even when the global toggle is off).

## Build an installable zip

From the `integrations/wordpress/` directory:

```powershell
Compress-Archive -Path ai-avatar -DestinationPath ai-avatar-1.0.0.zip -Force
```

The resulting `ai-avatar-1.0.0.zip` can be installed on any WordPress site via "Plugins → Upload Plugin".

## Submitting to the WordPress.org directory

Assets are ready: icon / banners / 3 screenshots / readme.txt (English + External services + Privacy).

### ⚠️ Required before submitting (we can't do these for you)

1. **Register a wordpress.org account** → [register](https://wordpress.org/register/)
   - Note your username (e.g. `xieshuhua1511`)
2. **Edit line 2 of readme.txt**:
   ```
   Contributors: aiavatarteam   ← replace with the wordpress.org username you just registered
   ```
   The current `aiavatarteam` is a placeholder and isn't registered on wp.org — submitting as-is will be rejected.
3. **Publish `/terms` and `/privacy` pages on avataraisdk.com**
   The External services section in readme.txt links to both — reviewers will click them, and a 404 is an instant rejection.
4. **(Optional) Reshoot screenshot-3 to fix the typo `artcle` → `article`**

### Submission flow

1. Pack `ai-avatar/` into a zip:
   ```powershell
   cd integrations/wordpress
   Compress-Archive -Path ai-avatar -DestinationPath ai-avatar-1.0.0.zip -Force
   ```
2. Upload to [https://wordpress.org/plugins/developers/add/](https://wordpress.org/plugins/developers/add/)
3. Wait 1–4 weeks for human review
4. Once approved, you get an SVN repo address — push code + assets via SVN
