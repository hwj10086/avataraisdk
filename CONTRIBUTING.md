# Contributing to avataraisdk

Thanks for taking the time to contribute! This repo hosts the open-source SDK and platform integrations for the [avataraisdk](https://www.avataraisdk.com) hosted service.

## What's in scope for PRs

Welcome:

- Bug fixes in `sdk/`, `packages/embed-sdk/`, or any folder under `integrations/`.
- New platform integrations under `integrations/` (e.g. Drupal, Joomla, Magento, Bubble, Framer).
- New runnable demos under `examples/`.
- Documentation fixes (typos, broken links, clearer phrasing).
- Translations for the WordPress plugin (under `integrations/wordpress/ai-avatar/languages/`).

Out of scope (these live in private repos):

- The 3D rendering pipeline, hosted backend, billing, console UI, or admin tools.
- Changes to the public hosted API contract — open a discussion first.

## Quick workflow

1. **Open an issue first** for anything bigger than a typo, so we can agree on the approach before you write code.
2. **Fork the repo**, create a feature branch off `main` named `fix/...`, `feat/...`, or `docs/...`.
3. **Make your change** — keep PRs focused on one thing.
4. **Test locally** (see per-folder READMEs for build instructions).
5. **Open a PR** against `main` and fill in the PR template.

## Local development

Each folder is self-contained — see its README:

- [`sdk/`](./sdk) — Vite library mode, three entry points.
- [`packages/embed-sdk/`](./packages/embed-sdk) — tsup, builds vanilla + React + Vue.
- [`integrations/wordpress/`](./integrations/wordpress) — PHP, no build step.
- [`integrations/shopify/`](./integrations/shopify) — Shopify CLI.

## Commit messages

Prefer Conventional Commits (`fix:`, `feat:`, `docs:`, `chore:`). Chinese or English is fine — write whichever you can describe the change most clearly in.

## Code of Conduct

This project follows the [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md). Report unacceptable behavior to hello@avataraisdk.com.

## License

By submitting a PR you agree that your contribution will be licensed under the same terms as the folder it touches — MIT for most of the repo, GPLv2+ for the WordPress plugin.
