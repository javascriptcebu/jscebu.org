# v1 review fixes: implementation plan

## Open questions for a lead — answer before implementation

| ID | Decision | Options and recommendation | Lead answer and source |
|---|---|---|---|
| Q1 | Should the official channels include Website? | Recommend keeping the current four channels and correcting the v1 spec, since Website links back to the site displaying the list. Alternatively add `https://www.jscebu.org/` with a lead-selected label/order; this also changes the home Join section. | Pending |
| Q2 | Which GitHub user or team owns deployment configuration review? | Supply an explicit eligible owner for `/apps/website/wrangler.jsonc` and `/.github/CODEOWNERS`. Do not infer a team slug or assign an individual from authorship alone. | Pending |

**Approval gate:** this is plan phase. A lead answers Q1–Q2 and returns the card to Todo to approve the plan. Record answer sources here and update the spec before implementation. No code, dependencies, workflow or policy changes in this planning run.

**Goal:** Resolve all nine GH-9 review findings with regression coverage and no changes to the DNS surface.

**Architecture:** Keep the existing static Astro site, asset-first Worker, brand source of truth and CI structure. Share URL resolution inside the website checker and color detection through the brand package; strengthen checks around existing outputs and configuration.

**Tech stack:** Astro, TypeScript, Vitest, linkedom, pnpm and local Workers assets. Select compatible Astro checking and JSONC parsing dependencies during build; verify CI action runtimes from official manifests.

**Spec:** [v1 review fixes: design](../specs/2026-10-30-v1-review-fixes-design.md).

**Execution:** Perform these tasks directly. Use the named Superpowers workflows if available; they and subagents are not prerequisites under the session instructions. Write failing tests before implementation where code can be tested. Do not copy old plans' deploy, DNS, commit or push commands; the current session prohibits those actions.

## Evidence and constraints

- Clean sync at `1ea2203`; branch `symphony/gh-9`; no branch PR found at plan start.
- The previous workpad's missing-skills blocker is superseded by explicit session permission to perform the planning steps directly. No earlier plan exists to approve.
- Reproduced: `pnpm --filter website exec tsc --noEmit` exits 1 with five errors in `test/content.test.ts` (TS2740 at 13/23/33/50, TS2345 at 34).
- Local checker probe: zero of ten redirect sources ends in `/`; `/about/#missing-anchor` produces no missing-link report when `/about/` exists.
- Source inspection confirms `/404.html`, `.html` template metadata, absent CSS charset rule, missing sitemap checks, duplicate color regexes, omitted Website content and all three CI actions at v4.
- GitHub's official latest-release endpoints returned checkout `v7.0.1`, setup-node `v7.1.0` and pnpm/action-setup `v6.1.0` on 2026-10-30. These are discovery results, not approved pins or runtime verification; inspect manifests and migration notes before selecting compatible versions.
- Never edit `routes` in `apps/website/wrangler.jsonc`; add tests and ownership only. No DNS, deployment, repository settings or branch protection changes.
- Brand metadata changes require a version bump plus changelog: propose patch `0.1.1`, with matching `packages/brand/package.json` and brand data. No design values or Bisaya approvals change.

## File map

| Area | Files to modify or add after approval |
|---|---|
| Fallback | `apps/website/worker/index.ts`, new `apps/website/test/worker.test.ts` |
| Brand URLs and release | `packages/brand/src/brand.ts`, `packages/brand/package.json`, `packages/brand/test/generate.test.ts`, lockfile metadata if required |
| Brand page template behavior | `apps/website/src/pages/brand/index.astro`; built-page assertions in `apps/website/scripts/check-dist.ts` and `apps/website/test/check-dist.test.ts` |
| Shared color detection | new `packages/brand/src/color-literals.ts`, `src/index.ts`, `src/lint.ts`, brand tests |
| Built-output validation | `apps/website/scripts/check-dist.ts`, `apps/website/test/check-dist.test.ts` |
| Redirects and HTTP checks | `apps/website/public/_redirects`, `test/redirects.test.ts`, `scripts/url-matrix.sh` |
| Headers | `apps/website/public/_headers`, new focused header test |
| Type checks | `apps/website/package.json`, `src/content/schemas.ts`, `test/content.test.ts`, any real Astro diagnostics exposed, `pnpm-lock.yaml` |
| Channel decision | v1 spec; `apps/website/src/content/links.json` and its content test only if Q1 selects Website |
| CI and ownership guard | `.github/workflows/ci.yml`, new `.github/CODEOWNERS`, new `apps/website/test/deployment-config.test.ts`, parser dependency only if needed |

`src/...` and `test/...` entries without a package prefix in a row refer to that row's package. Keep physical template filenames and generated outputs unchanged.

### Task 1: Finish planning and record approval

- [x] Read sync, AGENTS.md, GitHub skill, issue/workpad, card and PR status.
- [x] Move Todo to In Progress; establish that this bundle requires planning.
- [x] Inspect source and existing spec/plan conventions; reproduce type-check and checker gaps.
- [x] Write this plan and spec with lead-only questions at the top.
- [x] Run `pnpm test` and `pnpm build`; review all changed and untracked files.
- [x] Prepare ignored host handoff files using `Plan: ` and `Refs #9`; write commit message last among local handoff writes.
Plan handoff completion is recorded in the single workpad as `Phase: plan, awaiting approval`; moving this card to Human Review is the final action.
- [ ] On a later approved run, collect trusted issue and PR feedback, record Q1–Q2 answers with sources and update these documents before building.

### Task 2: Fix the fallback and canonical template URLs

- [ ] Add a Worker handler test requiring ASSETS to receive `/404` on the request origin; assert response status 404, body and preserved headers. Run it and observe the old path fail.
- [ ] Change only the fallback request path; retain the entry point and asset-first configuration.
- [ ] Add explicit brand-generation assertions for both extensionless template URLs and absence of their `.html` published URLs. Run before changing the metadata to observe failure.
- [ ] Update the two brand asset paths; bump brand/package versions to `0.1.1` and add a changelog entry. Keep physical `.html` templates and source design values intact.
- [ ] Add a built-page checker assertion and focused fixtures requiring both canonical template links in `/brand/`'s `#downloads` section to exist without a `download` attribute. Prove a fixture with `download=""` fails and a link without the attribute passes. Wire the assertion into `check-dist`'s `main()` so the real rendered page is checked by `pnpm build`. After changing the metadata, run the build before fixing the page and observe the existing `.html` suffix condition fail this check.
- [ ] In `apps/website/src/pages/brand/index.astro`, replace the `a.path.endsWith('.html')` download decision with the stable `/brand/templates/` prefix (or equivalent explicit template identity). Template links must open their HTML; retain `download` for the other downloadable assets. Verify both canonical hrefs and absent `download` attributes in the rendered output, and confirm the cover iframe and its adjacent link use the canonical cover URL. Rerun focused checker tests and the build.
- [ ] Add resolver tests for extensionless template success, missing template failure, direct assets, slash-ended page folders, rejection of bare folders and `.html` canonicalization hops.
- [ ] Implement a pure/testable resolver in the website checker and use it wherever URLs are validated. Keep physical required-file checks distinct. Run focused brand and checker tests, then build.

### Task 3: Cover trailing-slash redirects and CSS headers

- [ ] Expand the redirect test to pin all twenty rows: each original source plus its slash variant, with identical target/status. Observe failure with the current ten-row file.
- [ ] Add the ten slash rows without broad wildcard rules or destination changes.
- [ ] Add a focused header-policy test requiring the exact CSS charset rule while retaining wildcard CORS; observe failure, then add the rule.
- [ ] Extend the URL matrix to exercise all twenty redirects, extensionless templates returning 200 without Location, and tokens CSS charset plus CORS. Retain genuine missing-page 404 checks.

### Task 4: Make type and Astro diagnostics part of tests

- [ ] Preserve the currently failing `tsc --noEmit` reproduction as the initial red signal; inspect Astro's schema context and existing content tests before editing.
- [ ] Add a compatible `@astrojs/check` dependency with pnpm and update the lockfile. Add `check` = Astro sync + Astro check + `tsc --noEmit`, and run it before Vitest from website `test`.
- [ ] Make the schema factories generic over their supplied image schema, preserving Astro image metadata inference in production and string inference for test stubs. Avoid assertions, `any`, diagnostic ignores and excluding test files.
- [ ] Fix genuine additional diagnostics the new check exposes. If tooling rejects root TypeScript 7, select a compatible explicitly scoped tooling version after checking official requirements; do not silently remove either TS or Astro coverage.
- [ ] Verify generated collection types are fresh, `pnpm --filter website check` passes and `pnpm test` actually invokes it. Retain all content assertions and on-disk photo checks.

### Task 5: Validate redirect fragments and sitemap entries

- [ ] Add fixtures with a valid and missing redirect anchor, a missing destination file, percent-encoded IDs and malformed encodings; failures must identify source and target. Cover external redirects being skipped and same-origin absolute destinations being checked.
- [ ] Add sitemap fixtures for a valid page, a missing page, a legacy redirect source, a slash-less folder URL and a foreign origin. Parse XML `loc` elements; do not rely on the HTML attribute scanner.
- [ ] Run the focused tests and observe failures, then implement the checks using Task 2's resolver. Look up fragments in parsed destination HTML IDs; preserve existing cursor, parity, links and source-literal checks.
- [ ] Integrate both checks into `main()` so `pnpm build` exercises the built sitemap and redirect targets. Run checker tests and the build, confirming current `#organizers` and `#events` pass.

### Task 6: Share color detection without changing policy

- [ ] Add parameterized helper cases covering 3/4/6/8-digit hex, supported color functions, variables and `url(#id)` references; retain existing selector tests in `lintHtml` and website line-number diagnostics.
- [ ] Export one color-match helper from the brand package and replace both copies of the regexes with calls to it. Keep HTML declaration-only scanning and website source scanning separate; keep font-family handling local.
- [ ] Run focused brand lint/generation and website checker tests. Confirm the existing brand/template checks still pass and the new release changelog describes the public helper.

### Task 7: Resolve the channel mismatch from Q1

- [ ] If Q1 retains Website: add its lead-approved label/order and canonical URL to `links.json`, assert the entry and order, and verify both `/links/` and the home Join section. Keep collection-based rendering.
- [ ] If Q1 removes Website: update the v1 spec §3 channel list with a decision note and source; keep the current four-entry collection unchanged.
- [ ] In either case, make the approved spec and content agree; do not invent a channel or rely on an unrecorded assumption.

### Task 8: Modernize CI actions and guard deployment scope

- [ ] Inspect official release notes and `action.yml` for compatible checkout/setup-node/pnpm action versions using a runtime newer than Node 20. Recheck the discovery versions above; record the selected references and runtime evidence.
- [ ] Update the three references and any documented migration requirements; preserve pnpm 11.3.0, project Node 24, frozen install, tests and build. Do not add deployment actions.
- [ ] Add a structural JSONC config test expecting exactly the current www Custom Domain array and no top-level singular `route`. Reject the presence of either `route` or `routes` under every named `env` configuration and under `previews`, including empty values. Use existing parser tooling if present, otherwise add a small explicit JSONC dev dependency.
- [ ] Prove the guard fails for apex/wildcard/extra host, `custom_domain: false`, extra top-level routes, a top-level singular `route`, and separate singular `route` and plural `routes` cases in both `env.<name>` and `previews`. Keep the current empty `previews` object passing. Mutate fixture data only, never real routes.
- [ ] Add CODEOWNERS entries for the Wrangler file and CODEOWNERS itself using the explicit Q2 owner. State in the handoff that this does not change branch-protection settings.
- [ ] Confirm `git diff -- apps/website/wrangler.jsonc` is empty and run focused configuration tests. CI's hosted execution is observed only after the host pushes; do not claim an unseen result.

### Task 9: Validate and hand off the build

- [ ] Run `pnpm install --frozen-lockfile`, `pnpm test`, and `pnpm build`. All must pass; record actual output and counts rather than assuming the old baseline.
- [ ] Use supported local-only Workers asset serving to run the expanded URL matrix. Load applicable local tooling guidance if available; never deploy. Record statuses, redirects, charset/CORS, templates and missing-page 404 results. Unit-test the dormant fallback separately.
- [ ] Separately start Astro dev (`pnpm --filter website dev`) and Astro preview (`pnpm --filter website exec astro preview`, after build), each on an available local port. Check `/brand/`, both extensionless template URLs and the cover iframe URL; record HTTP statuses and any redirects for each server, then stop both. Do not assume these servers implement Workers HTML asset resolution. If canonical URLs fail only in Astro, document the verified local-preview limitation in the handoff; the Workers URL matrix must still pass. Do not restore redirecting public `.html` URLs to mask a server difference.
- [ ] Review `git diff origin/main`, untracked files and `git diff --check`. Confirm no generated outputs, secrets, unrelated changes or route edits.
- [ ] Check every issue acceptance item below against evidence. Handle trusted lead feedback and every must-fix review item, or record reasoned pushback in its proper thread/workpad.
- [ ] Rewrite host PR title/body around implemented behavior, remove `Plan: `, include `Closes #9` and real validation, and end with the Symphony/lead-review sentence. Write `.symphony/commit.txt` last among local handoff writes.
- [ ] Set workpad `Phase: build, handed off`, then move only this card to Human Review as the final action. Do not merge, push, deploy or claim the host's future PR/CI results.

## Acceptance criteria

- [ ] Worker fallback requests `/404` and returns the intended 404 response under a direct handler test.
- [ ] Brand metadata publishes both extensionless template URLs, served by local Workers assets without a redirect; brand release version and changelog agree. Both template links in `/brand/`'s downloads section have canonical hrefs and no `download` attribute, with built-output regression coverage; other download behavior is preserved. The cover iframe and adjacent link use the canonical cover URL.
- [ ] All ten old URLs work in both source forms with the existing destinations and status codes.
- [ ] `pnpm test` includes passing Astro and TypeScript checks, with no weakened content validation.
- [ ] `/brand/tokens.css` is served locally as `text/css; charset=utf-8` with existing CORS.
- [ ] Build fails on missing redirect fragments and invalid/missing sitemap destinations; valid current outputs pass.
- [ ] Brand lint and website checker share one color detector with preserved diagnostics and scan contexts.
- [ ] `/links/`, home Join data and v1 spec match Q1's recorded decision.
- [ ] All three CI actions use verified runtimes newer than Node 20; project commands remain on Node 24.
- [ ] Config tests pin only the existing www Custom Domain, reject top-level singular `route` and both `route`/`routes` overrides in named environments and previews, and CODEOWNERS uses Q2's owner. Actual routes are unchanged.
- [ ] Astro dev and preview template/iframe HTTP behavior is checked separately and recorded; any limitation is distinguished from the required passing local Workers asset checks.
- [ ] Frozen install, root tests/build, focused regressions, local HTTP checks and whole-branch review pass.

## Plan-phase validation

Required now: `pnpm test`, `pnpm build`, and review of the diff plus untracked files. Planning prose does not need tests that assert its wording. Record current results in the workpad; leave build acceptance boxes open until implementation. Production HTTP and hosted CI are not part of this plan-phase run.

2026-10-30 plan-phase results: frozen install passed (already up to date); root tests passed (93 brand + 21 website = 114 tests in 11 files); root build and check-dist passed (14 required files, 6 pages, 10 redirects). The separate `tsc --noEmit` reproduction remains a five-error baseline failure to resolve after approval. Whole-branch and untracked-file review found only this plan and its spec; relative documentation links and whitespace checks pass. No application, dependency, CI, ownership or route files changed.

## Review round 1 revisions

2026-10-30: [Claude review on PR #16](https://github.com/javascriptcebu/jscebu.org/pull/16#issuecomment-6519831600) requested changes to this plan, without approving implementation. The must-fix is covered by the brand page file-map entry, Task 2's stable template identity and built-page `download` regression checks, and the template acceptance criterion. Both suggestions are incorporated: Task 9 records Astro dev/preview behavior separately from Workers, and Task 8 covers singular and plural route keys with failure fixtures. Q1 and Q2 remain pending; all build-phase checkboxes remain open.

Rework validation: frozen install passed; `pnpm test` passed all 114 tests across 11 files; `pnpm build` passed, including check-dist (14 required files, 6 pages, 10 redirects). Source inspection confirmed the suffix-based download decision, and a direct expression probe with `/brand/templates/event-post` returned an empty download attribute. Reviewed the whole-branch diff against `origin/main`, untracked-file status and whitespace: only these two planning documents changed; Wrangler configuration is untouched. Dev/preview behavior and new regression tests remain build-phase work, not results claimed by this rework.
