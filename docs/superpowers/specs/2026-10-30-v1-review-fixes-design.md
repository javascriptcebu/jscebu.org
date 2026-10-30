# v1 review fixes: design

- **Date:** 2026-10-30
- **Issue:** [GH-9](https://github.com/javascriptcebu/jscebu.org/issues/9)
- **Status:** proposed; awaiting plan approval and lead decisions
- **Scope:** the nine deferred v1 review findings; no deployment, DNS changes or route edits

## 1. Intent and approval boundary

Remove redirect hops from published asset links, preserve old URLs, make the existing build checks cover their blind spots, and protect the deployment configuration from accidental expansion. The original v1 design remains the content reference except for the explicitly approved clarification to its `/links` row.

This spec and its [implementation plan](../plans/2026-10-30-v1-review-fixes.md) are the deliverables for this run. The issue combines tooling dependencies, CI and ownership policy, so it exceeds the small-fix exception. Initial Todo approves intent only. No implementation occurs before plan approval; the plan lists the lead-only decisions at its top. Missing Superpowers skills do not prevent performing these steps directly under the session instructions.

## 2. Evidence from this checkout

At HEAD `1ea2203` on `symphony/gh-9`:

- `apps/website/worker/index.ts` requests `/404.html`. `wrangler.jsonc` already uses asset-first serving with `not_found_handling: "404-page"`; retaining the fallback and correcting its path avoids removing the entry point or changing configuration.
- The two template asset paths in `packages/brand/src/brand.ts` end in `.html`. `brandMd()` publishes those values directly. Physical template files must retain `.html` for static asset serving and local use.
- `_redirects` has ten rows, all without trailing slashes. A local inspection through `parseRedirects()` reports `slash redirects: 0 of 10`.
- `pnpm --filter website exec tsc --noEmit` exits 1 with TS2740 at `test/content.test.ts:13, :23, :33, :50` and TS2345 at `:34`. Tests substitute `z.string()` for an image helper whose declared type only accepts Astro's image metadata schema.
- Website `test` runs only Vitest. `tsc` does not check `.astro` templates.
- `_headers` gives Markdown and plain text explicit charsets but gives `/brand/*` only CORS. There is no specific CSS content-type rule.
- `check-dist` strips fragments before existence checks, does not feed `sitemap.xml` through a link check, and repeats the color regexes from `packages/brand/src/lint.ts`. A synthetic `/about/#missing-anchor` is accepted when only `/about/` is known to exist.
- v1 spec §3 lists Website as an official channel; `links.json` has Facebook, X, GitHub and Email. Both the home Join section and `/links/` consume that collection.
- All three CI actions use `@v4`. The Node 24 version configured for project commands does not set the actions' own JavaScript runtimes.
- `wrangler.jsonc` has exactly `[{ "pattern": "www.jscebu.org", "custom_domain": true }]` in top-level routes and an empty `previews` object. No CODEOWNERS file exists in this checkout.

The deployed HTTP symptoms in the issue are supplied findings, not fresh production measurements in this run. Implementation verification will use local Workers asset serving; production and DNS remain untouched.

## 3. Proposed behavior

### Canonical static assets and the 404 fallback

Keep the Worker entry point and change its asset request to `/404`. A unit test invokes the handler with an ASSETS stub, requires that path on the incoming origin, and verifies a real 404 with the returned body and headers. The stub must detect the old `/404.html` path. The assets layer's miss handling remains configured as it is today.

Publish `/brand/templates/event-post` and `/brand/templates/fb-cover` from the brand asset data. Keep the source and copied `.html` files unchanged. Updating this public brand metadata is a patch release: align the package and brand-data versions to `0.1.1` and add a dated changelog entry describing the canonical template URLs and shared checker helper. Do not change colors, typography, logo assets or approved phrases.

Give the build checker one URL-to-built-file resolver matching the relevant static asset rules: `/folder/` resolves to `folder/index.html`, extensionless HTML paths resolve to their sibling `.html` file, and direct non-HTML assets resolve as files. Bare folder URLs and public `.html` links that incur canonicalization remain failures. Required physical output checks still refer to actual `.html` files. This does not relax the trailing-slash rule for page folders.

### Legacy redirects and CSS headers

Add a slash variant for each of the ten old URL sources, preserving each destination, fragment and status (including the temporary events 302). Pin all twenty rows in the regression test and exercise both forms in the local URL matrix.

Add an exact `/brand/tokens.css` header rule with `Content-Type: text/css; charset=utf-8`. Preserve the wildcard CORS rule and verify both headers together under local asset serving.

### Type checking

Add a website `check` script that runs Astro sync, `astro check` and `tsc --noEmit`; invoke it from the existing website `test` script before Vitest. Install a compatible `@astrojs/check` dependency and update the lockfile without suppressing diagnostics or relying on an interactive auto-install prompt. Verify compatibility with the repository's TypeScript version during implementation.

Make the image schema factory accept a typed generic Zod schema provider so both Astro's real image metadata and the tests' string stand-in preserve their inferred output types. Keep real image resolution in production, raw-path existence checks in tests and existing content validation. Do not hide the mismatch with `any`, blanket assertions, diagnostic ignores or excluded tests. Resolve additional real diagnostics exposed by `.astro` checking within this issue's type-check scope.

### Build-check coverage and shared color detection

Use the shared resolver for page links, brand documentation, sitemap entries and same-site redirect destinations. Validate each redirect's nonempty fragment against the destination HTML's IDs, including percent decoding; errors identify the source, target and missing anchor. Malformed encodings should produce a useful validation failure rather than an uncaught exception. External redirect targets remain outside local file/fragment validation.

Parse the built sitemap as XML, read each `loc`, and verify that its canonical same-site URL resolves to a built output. Missing pages, redirect sources and slash-less folder URLs fail. Do not crawl external sites or treat arbitrary XML text as links.

Move the existing hex/color-function matching into one small helper exported by `@jscebu/brand`. Both `lintHtml` and `findLiterals` use it while retaining their different scan contexts and diagnostics. Preserve selector and `url(#id)` handling; font-family detection remains website-specific. This is consolidation of existing rules, not a new color policy.

### Official channels

Follow Q1 in the plan. If Website is retained, add a canonical home URL entry with a stable ID, lead-approved label/order, and a content assertion; check both consumers of the collection. If it is removed, amend the v1 spec's channel list with an explicit decision note and retain the existing content. Do not infer the intended choice from either document alone.

### CI and configuration ownership

Move all three CI action references to supported releases whose action manifests use a runtime newer than Node 20, retaining Node 24 and pnpm's package-manager pin for project commands. Recheck official release notes, manifests and migration requirements at build time; keep checkout, package-manager setup, node setup and frozen install in a working order. No deployment job is added.

Add a structural test of the existing JSONC configuration. It must pin the exact top-level route array to the one www Custom Domain and reject environment/preview route additions that would expand the deployment surface. Parse JSONC reliably rather than stripping comments with an unsafe regex. Prefer an existing parser if available; otherwise add a small explicit development dependency and lockfile update. Never edit the routes themselves.

Create `.github/CODEOWNERS` using only the owner selected in Q2. Cover `/apps/website/wrangler.jsonc` and the ownership file itself. CODEOWNERS requests review; it does not prove that branch protection enforces approval. Changing repository settings or branch protection is outside scope.

## 4. Verification and boundaries

Write failing regression tests before each tested behavior, then implement and rerun the focused checks. Cover the URL resolver's canonical success/failure cases, missing/existing fragments, sitemap targets, redirects, CSS headers, image schema inference, shared color matching and exact deployment routes. Use temporary route mutations in fixtures or pure validation inputs to prove the guard detects added/wrong hosts without editing the real configuration.

Run frozen install, `pnpm test` and `pnpm build`. For HTTP behavior, use the existing local Workers asset workflow with supported local-only tooling, never a deploy. Extend and run `url-matrix.sh` against that local origin for all slash redirects, both extensionless templates, CSS charset/CORS and a genuine 404. A direct Worker unit test covers the fallback that asset-first misses may bypass.

Review the full branch against `origin/main` and all untracked files. Keep generated brand copies, build output, tool state and secrets out of the change. The host handles commits, feature-branch pushes and PR updates. Handoff is Human Review; only a lead merges, and merge deploys.
