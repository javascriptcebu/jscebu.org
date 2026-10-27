# Contributing

Thanks for helping JavaScript Cebu.

## Brand changes are releases

`packages/brand` is the JS Cebu design system. A change to a color, font, rule, logo or template is a **versioned release** (for example v0.1 → v0.2), not a drive-by edit:

1. Open an issue or PR that says what changes and why.
2. Bump `version` in `packages/brand/src/brand.ts` and add a `changelog` entry describing the change.
3. A JS Cebu lead approves it before merge.

## Before you open a PR

```sh
pnpm install
pnpm test
pnpm build
```

All tests must pass. CI runs the same commands.

## Never commit secrets

This repository is public. No tokens, API keys, form responses or personal data. Deploy credentials live in Cloudflare and GitHub secrets.
