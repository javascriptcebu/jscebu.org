# AGENTS.md

Instructions for AI coding agents (and humans) working on this repo.

## What this is

- The JavaScript Cebu monorepo, live at https://www.jscebu.org.
- `packages/brand` is the design system, and the single source of truth. It holds brand data and generates `tokens.css`, `brand.md` and `llms.txt`. It also holds the logos, the templates and an HTML checker (`lintHtml`).
- `apps/website` is a static Astro 7 site, deployed as the Cloudflare Worker `jscebu-org` on www.jscebu.org.
- Specs and plans are in `docs/superpowers/specs/` and `docs/superpowers/plans/`.

## How work ships

**Intent → plan → approval → implementation → review → merge.** Merging to `main` deploys to production through Cloudflare Workers Builds.

1. **Intent:** a GitHub issue or request that says what should change and why.
2. **Plan:**
   - For anything bigger than a small fix, use `superpowers:brainstorming` to write a spec.
   - Then use `superpowers:writing-plans` to write a plan.
   - Both are saved under `docs/superpowers/`.
3. **Approval:** a JS Cebu lead approves the spec or plan before any code.
4. **Implementation:**
   - Work on a branch, never on `main`.
   - Write tests first (`superpowers:test-driven-development`).
   - Execute plans with `superpowers:executing-plans` or `superpowers:subagent-driven-development`.
5. **Review:**
   - CI must pass: `pnpm install --frozen-lockfile && pnpm test && pnpm build`.
   - A whole-branch review follows (`superpowers:requesting-code-review`).
6. **Merge:** only with a lead's go. **Merge is deploy.**

## Commands

```sh
pnpm install
pnpm test                         # brand + website tests
pnpm build                        # builds the site and runs check-dist (post-build checks)
pnpm --filter website dev         # local preview
apps/website/scripts/url-matrix.sh https://www.jscebu.org   # live URL checks
```

## Rules that the build enforces, and ones it doesn't

- **The design system is the source.** Put values in `packages/brand/src/brand.ts`, not in pages.
  - `apps/website/src` must have no hex, `rgb()`, `hsl()` or `font-family` literals. Use the `--jc-*` variables. `check-dist` fails the build otherwise.
- **The cursor:** every page's primary headline ends with `<Cursor>`, which keeps the last word and the cursor together in `.jc-nw`.
- **Internal links end in `/`** (`/about/`, `/brand/`). A link to a missing or slash-less folder fails the build.
- **Content** lives in `apps/website/src/content/`: Markdown and JSON collections, validated by zod.
- **Old URLs** are redirected in `apps/website/public/_redirects`, and a test pins every row.
- **Bisaya** appears only after a lead approves the phrase (`status: 'approved'`). A test keeps drafts out of examples and templates.
- **Brand changes are versioned releases:** bump the version and add a changelog entry.
- **Motion** is transform and opacity only, and stops entirely under `prefers-reduced-motion`. Content never depends on JavaScript to be visible.
- **Design work:** read `.impeccable.md` first, then use the impeccable skills in `.claude/skills/`.
- **Making a graphic or page for JS Cebu:** follow https://www.jscebu.org/brand.md, especially its MUST checklist.

## Never

- Run `wrangler deploy` by hand, or change Cloudflare DNS or zone settings. Deploys come from `main`.
- Edit `routes` in `apps/website/wrangler.jsonc` without a lead's approval. Deploys from CI override DNS for any Custom Domain listed there.
- Commit secrets, tokens, form responses or personal data. This repo is public.
- Merge, push to `main` or publish anything without a lead's explicit go.

## Commit messages

- The subject is imperative and about 50 characters. A conventional prefix is fine.
- The body has one line per paragraph, with no hard wrapping.
