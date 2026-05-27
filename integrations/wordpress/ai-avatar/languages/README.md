# Translations

## How WordPress picks a translation

1. WordPress reads the site language (`Settings → General → Site Language`)
2. Say it's `Simplified Chinese`, locale = `zh_CN`
3. WordPress looks for `languages/ai-avatar-zh_CN.mo` → found → shows Chinese
4. Not found → falls back to the English strings in the PHP source

## Files

| File | Purpose | Read by |
|---|---|---|
| `ai-avatar.pot` | Translation template — all msgids, empty msgstrs | Translators starting a new language |
| `ai-avatar-{locale}.po` | Source translation for a given language (human-readable/editable) | Translators |
| `ai-avatar-{locale}.mo` | Compiled binary (machine-readable) | WordPress at runtime |
| `compile-mo.mjs` | Node script that compiles .po into .mo | Maintainers |

## Editing a translation

1. Edit `ai-avatar-zh_CN.po` (update the relevant `msgstr`)
2. Recompile:
   ```powershell
   cd integrations/wordpress/ai-avatar/languages
   npm install gettext-parser --no-save
   node compile-mo.mjs
   ```
3. The .mo file is overwritten — WordPress picks up the new translation on the next request

## Adding a new language

Example: add Japanese `ja`

1. Copy `ai-avatar-zh_CN.po` → `ai-avatar-ja.po`
2. Change line 11 to `Language: ja\n`
3. Translate each `msgstr` into Japanese
4. Re-run `node compile-mo.mjs` → produces `ai-avatar-ja.mo`
5. Switch the site language to Japanese → WordPress automatically uses `ai-avatar-ja.mo`

## Locale reference

| Language | locale | Filename |
|---|---|---|
| Simplified Chinese | zh_CN | `ai-avatar-zh_CN.po/mo` |
| Traditional Chinese | zh_TW | `ai-avatar-zh_TW.po/mo` |
| Japanese | ja | `ai-avatar-ja.po/mo` |
| Korean | ko_KR | `ai-avatar-ko_KR.po/mo` |
| English (US) | en_US | (not needed — source is already English) |
