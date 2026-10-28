# Contributing

Thanks for helping JavaScript Cebu.

## How changes ship

Every change, from a person or an AI agent, follows the same path:

1. **Intent.** Open an issue, or start a conversation, that says what should change and why.
2. **Plan.** Larger changes get a written spec and plan under `docs/superpowers/` before anyone writes code.
3. **Approval.** A JS Cebu lead approves the plan.
4. **Implementation.** Build it on a branch and open a pull request.
5. **Review.**
   - CI runs `pnpm install --frozen-lockfile && pnpm test && pnpm build` on every pull request.
   - A reviewer reads the whole branch.
6. **Merge.** Merging to `main` deploys www.jscebu.org.

## Deploys

**Merging to `main` is the deploy.** Cloudflare Workers Builds builds `main` and deploys the `jscebu-org` Worker with these settings:

| Setting | Value |
|---|---|
| Root directory | repo root |
| Build command | optional: `apps/website/wrangler.jsonc` has a `build.command` that installs, builds the site and runs the post-build checks before every deploy and preview |
| Deploy command | `pnpm --filter website exec wrangler deploy` |
| Other branches | `npx wrangler preview` (Cloudflare's default; gives each branch a preview URL, and needs the `previews` block in `wrangler.jsonc`) |

Node comes from `.nvmrc` and pnpm from `packageManager` in `package.json`. A failing test or post-build check stops the deploy.

Don't run `wrangler deploy` by hand.

Be careful with `routes` in `apps/website/wrangler.jsonc`. www.jscebu.org is attached there as a Custom Domain. Deploys from CI replace any existing DNS record for a Custom Domain they list, so add or change a domain only through a reviewed pull request.

## Brand changes are releases

`packages/brand` is the JS Cebu design system. A change to a color, font, rule, logo or template is a **versioned release** (for example v0.1 → v0.2), not a drive-by edit:

1. Bump `version` in `packages/brand/src/brand.ts`.
2. Add a `changelog` entry describing the change.
3. A JS Cebu lead approves it before merge.

Bisaya copy appears only after a lead approves the phrase, which means its `status` is `approved`.

## Before you open a PR

```sh
pnpm install
pnpm test
pnpm build
```

All tests and checks must pass. CI runs the same commands.

## Never commit secrets

This repository is public. Never commit tokens, API keys, form responses or personal data. Deploy credentials live in Cloudflare and GitHub.
