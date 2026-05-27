# Security Policy

## Reporting a vulnerability

If you believe you've found a security issue in the avataraisdk SDK, integrations, or the hosted service, please **do not open a public GitHub issue**.

Instead, email **hello@avataraisdk.com** with:

- A description of the issue
- Steps to reproduce (PoC code or URL if available)
- Impact you observed
- Your contact info if you'd like credit in the fix advisory

We aim to acknowledge reports within **48 hours** and provide a substantive update within **7 days**.

## Scope

In scope:

- This repository (`sdk/`, `packages/embed-sdk/`, `integrations/*`, `examples/`)
- The hosted endpoints under `*.avataraisdk.com`
- The npm package `@ai-avatar/embed-sdk`
- The published WordPress plugin and Shopify extension

Out of scope:

- Vulnerabilities in third-party dependencies — please report those upstream first.
- Issues that require physical access to a user's device or an already-compromised account.
- Social engineering, phishing, or attacks on our staff.

## Disclosure policy

We follow coordinated disclosure: once a fix is ready and deployed, we'll publish an advisory on GitHub and credit the reporter (with permission).

## Safe harbor

Good-faith security research that respects this policy will not be subject to legal action from us. Please don't access data that isn't yours, degrade service, or test against customer sites that aren't yours.
