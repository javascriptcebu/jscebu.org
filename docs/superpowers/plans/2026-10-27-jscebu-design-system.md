# JS Cebu Design System v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship JS Cebu's design system v0.1 at `https://www.jscebu.org/brand`, with a human page, `brand.md` for agents, `llms.txt`, `tokens.css`, logo files and two templates, all generated from one data source in a public monorepo.

**Architecture:** This is a pnpm monorepo. `packages/brand` holds the single source of truth: typed brand data, plus generators that turn it into CSS and Markdown. It also holds the logo pipeline: a one-off Python trace of the PSD, followed by a repeatable TS build of every SVG/PNG variant. `apps/website` is a static Astro 7 site that renders `/brand` from that package. It deploys as a Cloudflare Worker serving static assets on a few `www.jscebu.org` routes, while every other path keeps going to the existing Vercel/Notion site.

**Tech Stack:**
- Node 24, pnpm 11, TypeScript 7, Vitest 5
- Astro 7.4 (static output, no adapter)
- Wrangler 4 (Workers static assets)
- @resvg/resvg-js, opentype.js 2, pngjs, linkedom
- @fontsource-variable/*, @fontsource/roboto
- Python via `uv`: psd-tools 1.26, numpy, scipy, potracer 0.0.4, pillow

**Spec:** `docs/superpowers/specs/2026-10-27-jscebu-design-system-design.md`. Read it first. Section numbers (§) below refer to it.

## Global Constraints

- Brand version `0.1.0`. Site origin `https://www.jscebu.org`.
- Colors (exact):
  - `yellow #FFDF00`, `ink #0E0F11`, `paper #F4F1EA`
  - Terminal text `#E9E9EC`, Terminal muted `#9C9CA3`, Terminal grid `rgba(255,255,255,0.045)`
  - Poster muted `#4A4316`, Journal muted `#6B675F`
- Yellow is never a text color on paper.
- Every text/background pair passes WCAG AA: 4.5:1, or 3:1 for text marked large.
- Fonts (approved as proposals, final sign-off at the Task 7 checkpoint):

  | Role | Font | Weights |
  |---|---|---|
  | Poster | Archivo | 900 and 600 |
  | Terminal | Space Grotesk | 700 and 400 |
  | Journal | Inter Tight | 800 and 400 |
  | Mono, every personality | JetBrains Mono | 400 and 600 |
  | Wordmark only | Roboto Black (900) | |

  The website self-hosts fonts through `@fontsource-variable/*`. `brand.md` gives agents Google Fonts URLs.
- CSS custom properties use the `--jc-` prefix. Personality scopes are the classes `.jc-poster`, `.jc-terminal` and `.jc-journal`.
- Cursor:
  - Solid block, about `0.5em × 0.8em`, baseline-aligned, `aria-hidden="true"`.
  - Color is ink on yellow, yellow on ink or paper.
  - Always wrapped with the last word in `.jc-nw` (`white-space: nowrap`).
  - Blinks at `1.05s steps(1)` on the web only, and never under `prefers-reduced-motion: reduce`.
  - One cursor per piece or screen.
- Sticker: rotate `-8deg` by default (allowed range 6–10° in either direction). The white die-cut edge is 5% of the mark's width. The shadow is optional.
- No hexagon shapes anywhere except the logo. Photos are never filtered.
- No hex, `rgb()`, `hsl()` or font-family literals anywhere in `apps/website/src`. Everything comes from `--jc-*` variables.
- Astro config: `output: 'static'`, `site: 'https://www.jscebu.org'`, `compressHTML: true`. Astro 7 defaults to `'jsx'`, which can eat the space before the cursor's word wrapper.
- Licensing: root `LICENSE` is MIT and covers code. `packages/brand/LICENSE` says the logos, the PSD and the name are © JavaScript Cebu and may be used as described at `/brand`. Fonts keep their own licenses.
- Repo: public `github.com/javascriptcebu/jscebu.org`. Nothing private goes in it: no tokens, no form data.
- Bisaya phrases ship with `status: 'draft'` until Dorell approves them at the Task 7 checkpoint.
- Commit messages: imperative subject of about 50 characters (conventional prefix fine). The body has one line per paragraph with no hard wrapping.
- Production changes need explicit confirmation from Dorell: DNS proxy toggles, Worker routes, zone settings.

## Review Focus

1. **A long headline on a narrow screen (320px)** must not leave the cursor alone on a line. Owners: Task 5 (`lintHtml` cursorAttached) and Task 6 (post-build check over `/brand`).
2. **A visitor with reduced motion enabled** must see a static cursor. Owner: Task 2 (a tokens.css test for the reduced-motion rule).
3. **An agent fetching `brand.md`, which contains non-ASCII characters (`·`, `→`, `—`, `°`)**, must get `text/markdown; charset=utf-8`, readable cross-origin. Owners: Task 7 (`_headers` plus a curl check) and Task 8 (the same check on www).
4. **Any non-`/brand` URL during and after the cutover** (`/`, `/events`, `/_next/*`, `/api/social-image`, the apex redirect) must behave exactly as before. Owner: Task 8 (the before/after URL matrix).
5. **A flat logo on a yellow background** must be the one-color version. Owners: Task 5 (lint rule `logoOnYellow` on the templates) and Task 4 (the variant-naming test).

---

## File Structure

```
(repo root ~/Projects/mine/jscebu)
package.json  pnpm-workspace.yaml  tsconfig.base.json  .nvmrc  LICENSE  README.md  CONTRIBUTING.md
.github/workflows/ci.yml
packages/brand/
  package.json  tsconfig.json  vitest.config.ts  LICENSE
  src/types.ts          Brand data types (the interface everything shares)
  src/brand.ts          THE source: values, personalities, signatures, MUST rules, voice, assets, changelog
  src/contrast.ts       WCAG luminance and ratio
  src/lint.ts           machine-checkable MUST rules for HTML
  src/generate/tokens-css.ts  src/generate/brand-md.ts  src/generate/llms-txt.ts
  src/index.ts          re-exports
  source/js-cebu-logo.psd  source/js-horizontal.png  source/mark-flattened.png
  source/regions/{ring,inner,blue,green,red,outer}.png  source/mark-paths.json
  scripts/logo/trace.py        PSD → flattened mark → region masks → mark-paths.json (one-off)
  scripts/logo/build-logos.ts  mark-paths.json + Roboto Black → assets/logo/* (repeatable)
  assets/logo/*.svg|*.png  assets/photos/community-meetup.jpg
  templates/event-post.html  templates/fb-cover.html
  test/*.test.ts
apps/website/
  package.json  astro.config.mjs  wrangler.jsonc  tsconfig.json
  worker/index.ts             misses → 404 page (assets are served first)
  public/_headers
  scripts/sync-brand.ts       copies brand assets and templates → public/brand/ (predev/prebuild; target gitignored)
  scripts/check-dist.ts       post-build: parity, links, cursor, literals
  src/layouts/Terminal.astro
  src/components/{Cursor,Sticker,Section,Swatch,PersonalityCard,RuleList}.astro
  src/pages/brand/index.astro  src/pages/brand.md.ts  src/pages/brand/tokens.css.ts  src/pages/llms.txt.ts  src/pages/404.astro
scripts/legacy-check.sh       URL status matrix for the cutover
```

---

### Task 1: Monorepo, brand data model and contrast checks

**Files:**
- Create: the root files above, `packages/brand/{package.json,tsconfig.json,vitest.config.ts,LICENSE}`, `src/types.ts`, `src/brand.ts`, `src/contrast.ts`, `src/index.ts`
- Test: `packages/brand/test/contrast.test.ts`, `packages/brand/test/brand.test.ts`

**Interfaces:**
- Produces, in `src/types.ts`:

```ts
export type Hex = `#${string}`;
export type FontId = 'archivo' | 'spaceGrotesk' | 'interTight' | 'jetbrainsMono' | 'roboto';
export type PersonalityId = 'poster' | 'terminal' | 'journal';
export interface ColorToken { id: 'yellow' | 'ink' | 'paper'; hex: Hex; role: string }
export interface FontToken { id: FontId; family: string; cssStack: string; googleFontsUrl: string; fontsourcePackage: string; weights: number[]; role: string }
export interface FontRef { font: FontId; weight: number; uppercase?: boolean }
export interface Personality {
  id: PersonalityId; name: string; use: string;
  colors: { bg: Hex; text: Hex; muted: Hex; accent: Hex; accentText: Hex; cursor: Hex };
  type: { headline: FontRef; body: FontRef; mono: FontRef };
  recipe: string[]; dont: string[]; exampleHtml: string;
}
export interface Signature { rank: 1 | 2 | 3 | 4; id: 'cursor' | 'sticker' | 'bisaya' | 'photos'; name: string; status: 'core' | 'experimental'; summary: string; rules: string[] }
export interface MustRule { id: string; text: string }
export interface Phrase { bisaya: string; english: string; use: string; status: 'draft' | 'approved' }
export interface Asset { id: string; label: string; path: `/brand/${string}`; use: string }
export interface TextPair { fg: Hex; bg: Hex; where: string; large?: boolean }
export interface Brand {
  name: 'JavaScript Cebu'; version: string; site: 'https://www.jscebu.org';
  colors: ColorToken[]; fonts: FontToken[]; personalities: Personality[];
  signatures: Signature[]; must: MustRule[];
  logoRules: string[];   // clear space, minimum sizes, which version on which background, sticker tilt and edge
  voice: { principles: string[]; phrases: Phrase[] };
  assets: Asset[]; textPairs: TextPair[];
  changelog: { version: string; date: string; notes: string[] }[];
}
```

- Produces: `export const brand: Brand` (`src/brand.ts`); `luminance(hex: Hex): number`, `contrastRatio(a: Hex, b: Hex): number` (`src/contrast.ts`).
- Package: `packages/brand/package.json` with `"name": "@jscebu/brand"`, `"type": "module"`, `"exports": { ".": "./src/index.ts" }` (TS source, used directly by Astro/Vite and `tsx`). Dependencies are added by the tasks that need them: `linkedom` (Task 5, runtime), and as devDeps `tsx`, `@resvg/resvg-js`, `opentype.js@2`, `pngjs`, `@fontsource/roboto` (Tasks 3–4).

- [ ] **Step 1: Initial commit, then branch.** Run `git add .gitignore docs && git commit -m "docs: add design system v0.1 spec and plan"` on `main`, then `git switch -c feat/brand-v0.1`.
- [ ] **Step 2: Scaffold the workspace.**
  - `pnpm-workspace.yaml` lists `packages/*` and `apps/*`. `.nvmrc` is `24`.
  - The root `package.json` scripts are `test` → `pnpm -r --if-present test` and `build` → `pnpm -r --if-present build`.
  - `LICENSE` is MIT, "Copyright (c) 2026 JavaScript Cebu".
  - `packages/brand/LICENSE` holds the brand-assets terms (Global Constraints).
  - `CONTRIBUTING.md` says brand changes ship as versioned releases with a changelog entry, and that tests must pass.
  - `README.md` links to `/brand` and the spec.
  - `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile && pnpm test && pnpm build` on PRs and pushes, using Node 24 and pnpm 11.
  - Install with `pnpm add -D -w typescript@7 vitest@5`.
- [ ] **Step 3: Write the failing tests.**

```ts
// contrast.test.ts
expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
expect(contrastRatio('#FFDF00', '#0E0F11')).toBeGreaterThan(14);
expect(contrastRatio('#FFDF00', '#F4F1EA')).toBeLessThan(1.3);   // why yellow is never text on paper
// brand.test.ts
for (const p of brand.textPairs) expect(contrastRatio(p.fg, p.bg), p.where).toBeGreaterThanOrEqual(p.large ? 3 : 4.5);
expect(brand.textPairs.some(p => p.fg === '#FFDF00' && p.bg === '#F4F1EA')).toBe(false);
expect(brand.colors.map(c => c.hex)).toEqual(['#FFDF00', '#0E0F11', '#F4F1EA']);
expect(brand.must).toHaveLength(10);
expect(new Set(brand.must.map(r => r.id)).size).toBe(10);
expect(brand.signatures.map(s => s.id)).toEqual(['cursor', 'sticker', 'bisaya', 'photos']);
expect(brand.voice.phrases.every(p => p.status === 'draft')).toBe(true);
for (const p of brand.personalities) for (const k of ['bg','text','muted','accent','accentText','cursor'] as const) expect(p.colors[k]).toMatch(/^#[0-9A-F]{6}$/);
```

- [ ] **Step 4: Run** `pnpm --filter @jscebu/brand test`. Expected: FAIL, modules not found.
- [ ] **Step 5: Implement the three files.**
  - `contrast.ts`: standard WCAG 2.x sRGB relative luminance.
  - `brand.ts`:
    - Values come from Global Constraints. The `must` list is the 10 items from spec §7, verbatim, with ids `yellow`, `logo-form`, `logo-on-yellow`, `cursor`, `one-personality`, `fonts`, `photos`, `no-hexagons`, `event-line`, `bisaya`.
    - Signatures, personality recipes and dont-lists come from spec §4.3–4.4.
    - Phrases: Salamat (thanks), Kita-kits (see you), Padayon (keep going), Code ta! (let's code), Apil na (join now), all `draft`.
    - Personality colors:
      - poster: bg yellow, text ink, muted `#4A4316`, accent ink, accentText yellow, cursor ink
      - terminal: bg ink, text `#E9E9EC`, muted `#9C9CA3`, accent yellow, accentText ink, cursor yellow
      - journal: bg paper, text ink, muted `#6B675F`, accent yellow, accentText ink, cursor yellow
    - `textPairs` covers every text use in those three, including the Poster footer bar (yellow on ink), the Terminal button (ink on yellow) and the Journal highlighter (ink on yellow).
    - `logoRules`:
      - Clear space on all sides equals the height of the "C" in CEBU. For the mark alone, it's 25% of the mark's height.
      - Minimum sizes: the mark at 24px tall on screen, the lockup at 120px wide. Below 120px, use the mark alone.
      - Use the ink or white one-color versions on yellow, the full color on ink or paper, and the sticker for expressive placements (spec §4.3).
      - The sticker tilts 6–10° and has a white edge of 5% of the mark's width.
    - Leave `exampleHtml` as `''` for now. Task 5 fills it.
- [ ] **Step 6: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 7: Commit:** `feat(brand): add brand data model and contrast checks`.

### Task 2: Generators: tokens.css, brand.md, llms.txt

**Files:**
- Create: `packages/brand/src/generate/{tokens-css,brand-md,llms-txt}.ts`
- Test: `packages/brand/test/generate.test.ts`

**Interfaces:**
- Consumes: `brand`, `Brand` (Task 1).
- Produces: `tokensCss(b: Brand): string`, `brandMd(b: Brand): string`, `llmsTxt(b: Brand): string`. All are pure, return deterministic text, and are re-exported from `src/index.ts`.

- [ ] **Step 1: Write the failing tests.**

```ts
const css = tokensCss(brand);
expect(css).toContain('--jc-yellow: #FFDF00;');
expect(css).toMatch(/\.jc-poster\s*{[^}]*--jc-bg:\s*#FFDF00/);
expect(css).toMatch(/\.jc-cursor\s*{[^}]*display:\s*inline-block/);            // block cursor present
expect(css).toMatch(/\.jc-nw\s*{[^}]*white-space:\s*nowrap/);
expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{[^}]*\.jc-cursor[^}]*animation:\s*none/);
expect(css).toMatch(/\.jc-sticker\s*{[^}]*rotate\(-8deg\)/);
expect(css).toContain('--jc-font-mono:');
const md = brandMd(brand);
expect(md.startsWith('# JavaScript Cebu brand · v0.1.0')).toBe(true);
for (const r of brand.must) expect(md).toContain(`- [ ] ${r.text}`);
for (const a of brand.assets) expect(md).toContain(`https://www.jscebu.org${a.path}`);
for (const p of brand.personalities) expect(md).toContain(`### ${p.id}`);
for (const r of brand.logoRules) expect(md).toContain(r);
expect(md).toContain('https://www.jscebu.org/brand/tokens.css');
expect(md).toMatch(/draft.*Dorell/i);           // drafts are labelled as not yet approved
expect(llmsTxt(brand)).toContain('https://www.jscebu.org/brand.md');
expect(tokensCss(brand)).toBe(tokensCss(brand)); // deterministic
```

- [ ] **Step 2: Run** `pnpm --filter @jscebu/brand test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `tokensCss` emits the following, built from `brand`:
    - `:root` with the colors, `--jc-font-{poster,terminal,journal,mono,wordmark}` stacks (fontsource family name first, then the Google family, then the generic), and `--jc-grid`.
    - One scope class per personality, setting `--jc-bg/text/muted/accent/accent-text/cursor`.
    - `.jc-cursor` with `width:.5em;height:.8em;background:var(--jc-cursor);display:inline-block;vertical-align:-.05em;margin-left:.08em`, and `.jc-cursor--blink` with the keyframes.
    - The reduced-motion override, `.jc-nw`, `.jc-sticker`, and `.jc-highlight` (the yellow band).
  - `brandMd` section order is fixed:
    1. Title, plus a one-paragraph purpose.
    2. `## MUST: check every piece` (the checklist).
    3. `## Logo` (the `logoRules`, plus absolute URLs for each version).
    4. `## Colors` (a table).
    5. `## Fonts` (with Google Fonts URLs).
    6. `## Personalities` (`### poster|terminal|journal`, each with use, colors, type, recipe, don't, and a fenced HTML example).
    7. `## Signatures` (ranked).
    8. `## Voice`, where draft phrases are marked "draft, not yet approved by Dorell".
    9. `## Assets` (absolute URLs).
    10. `## Changelog`.
  - `llmsTxt` follows the llmstxt.org shape: `# JavaScript Cebu`, a `>` summary, then `## Brand` with a link to `/brand.md` and `/brand`.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(brand): generate tokens.css, brand.md, llms.txt`.

### Task 3: Trace the logo mark from the PSD

**Files:**
- Create: `packages/brand/scripts/logo/trace.py`; outputs `source/mark-flattened.png`, `source/regions/*.png`, `source/mark-paths.json`
- Copy in: `~/Downloads/js-cebu-logo.psd` → `source/js-cebu-logo.psd` (verify sha256 starts `d7c26803`); `javascriptcebu/ai-jscebu:public/js-horizontal.png` → `source/js-horizontal.png` (fetch with `gh api repos/javascriptcebu/ai-jscebu/contents/public/js-horizontal.png -H "Accept: application/vnd.github.raw"`)
- Test: `packages/brand/test/trace.test.ts`

**Interfaces:**
- Produces `source/mark-paths.json`:

```ts
{ viewBox: [0, 0, 1005, 1006],
  paths: { ring: string; inner: string; blue: string; green: string; red: string; outer: string },   // SVG path d, source-pixel coords; ring uses evenodd
  gradients: { ring: Grad; blue: Grad; green: Grad; red: Grad } }
// Grad = { x1: number; y1: number; x2: number; y2: number; stops: { offset: number; color: Hex }[] }  (objectBoundingBox units)
```

- [ ] **Step 1: Write the failing test.** For each region `ring|inner|blue|green|red`, render `<svg viewBox="0 0 1005 1006"><path d=… fill="#000" fill-rule="evenodd"/></svg>` at 1005×1006 with `@resvg/resvg-js`. Threshold alpha > 127. Assert `IoU(rendered, regions/<id>.png) >= 0.97`. Also assert that `gradients.ring.stops` has a first color within 6/255 per channel of `#FF8F00` and a last color within 6/255 of `#FFDF00`.
- [ ] **Step 2: Run** it. Expected: FAIL, the JSON is missing.
- [ ] **Step 3: Implement `trace.py <psd> <outdir>`.**
  1. Open the PSD with psd-tools and take the flattened layer `Group 2 › Group 1 copy 2` (1005×1006). Save it as `mark-flattened.png`. Never use the cropped `Group 1`.
  2. Build the masks. `white` = alpha > 0 and min(r,g,b) ≥ 225. `colored` = alpha > 128 and not white. Label `colored` with 8-connectivity (`scipy.ndimage.label`) and keep the 4 largest components. `ring` is the component with the largest bbox. Classify the rest by mean hue: 180–260° → blue, 70–170° → green, otherwise red. `outer` = fill holes in ring. `inner` = outer and not ring.
  3. Clean each mask with a 1px binary opening.
  4. Trace each mask with `potracer` (turdsize=2, alphamax=1.0, opticurve=True, opttolerance=0.2) into an SVG path `d`.
  5. Gradients: take the angle from the PSD effect (ring 87°, blue 61°, green 90°, red 90°). Take the stop colors by sampling the flattened pixels at the 3rd and 97th percentile positions along that axis inside each region (spec §4.1: the flattened pixels win). Ignore the leftover `#FF11DB` stops.
  6. Write the region PNGs and the JSON.

  Run with:
  ```
  uv run --with psd-tools==1.26.0 --with numpy --with scipy --with potracer==0.0.4 --with pillow \
    python -I packages/brand/scripts/logo/trace.py packages/brand/source/js-cebu-logo.psd packages/brand/source
  ```
- [ ] **Step 4: Run** the tests. Expected: PASS. Then open the rendered regions next to the flattened PNG and check the curves for kinks. Adjust `opttolerance` if needed.
- [ ] **Step 5: Commit:** `feat(brand): trace logo mark from original PSD`. Include the PSD, the PNGs and the JSON.

### Task 4: Logo variants, wordmark and PNG exports

**Files:**
- Create: `packages/brand/scripts/logo/build-logos.ts` (script `build:logos` in the package), outputs in `assets/logo/`
- Test: `packages/brand/test/logos.test.ts`

**Interfaces:**
- Consumes: `source/mark-paths.json` (Task 3) and `@fontsource/roboto/files/roboto-latin-900-normal.woff`, parsed with opentype.js.
- Produces these files, which Tasks 5–6 use by these exact names:
  - **SVG:** `mark-color.svg`, `mark-ink.svg`, `mark-white.svg`, `sticker.svg`, `lockup-light.svg`, `lockup-dark.svg`, `lockup-ink.svg`, `lockup-white.svg`
  - **PNG:** each of the above at 1024px wide for marks and the sticker, 2048px wide for lockups, plus `sticker-tilted.png` (rotated -8°, 1024px)

- [ ] **Step 1: Write the failing tests.**
  - **Region color fidelity:** render `mark-color.svg` at 1005×1006. Within each `regions/<id>.png` mask, the mean absolute RGB difference from `mark-flattened.png` must be ≤ 16 per channel.
  - **One-color versions:** `mark-ink.svg` has no `#FFFFFF` and no gradient, its fills are all `#0E0F11`, and the `inner` pixels render transparent (alpha 0).
  - **Sticker:** its viewBox is larger than the mark by 5% of the mark width on each side, and it contains a white path drawn before the mark.
  - **Wordmark overlay:** render `lockup-light.svg` at 5045×1284. Take the dark pixels (luma < 60) in the area right of the mark and compare them with `source/js-horizontal.png`. IoU must be ≥ 0.90.
  - **Coverage:** every file listed in Produces exists. Every `lockup-*` and `mark-*` file whose name pairs it with a background (ink → yellow and light backgrounds, white → dark backgrounds) is listed in `brand.assets` with a `use` that names that background. This is Review Focus 5.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement `build-logos.ts`.**
  - Compose the SVGs from the JSON paths:
    - Color: ring with its gradient, `inner` white, then the three panels with their gradients.
    - Ink and white: ring plus panels in one color, with no `inner` fill.
    - Sticker: the `outer` path filled white and stroked white at 2 × the edge with round joins, underneath the color mark.
  - The wordmark is "JAVASCRIPT" over "CEBU" in Roboto Black, converted to path outlines. Get the lockup geometry (mark height, gap, line cap heights and baselines, left edge) by measuring the dark-pixel bounding boxes in `js-horizontal.png`, and record the numbers as named constants.
  - Export PNGs with resvg.
  - The script is idempotent. Run it with `pnpm --filter @jscebu/brand build:logos`.
- [ ] **Step 4: Run** the tests. Expected: PASS. Open `lockup-light.png` and `sticker-tilted.png` and compare them by eye with `source/js-horizontal.png`.
- [ ] **Step 5: Commit:** `feat(brand): build logo variants and lockups`.

### Task 5: Templates, HTML lint and personality examples

**Files:**
- Create: `packages/brand/src/lint.ts`, `templates/event-post.html`, `templates/fb-cover.html`, and `assets/photos/community-meetup.jpg` (the group photo from the jscebu.org homepage, 1728×1296, already published by JS Cebu)
- Modify: `src/brand.ts` (fill each `exampleHtml`, and add template and photo entries to `assets`)
- Test: `packages/brand/test/lint.test.ts`, `packages/brand/test/templates.test.ts`

**Interfaces:**
- Produces:
  - `lintHtml(html: string): { rule: 'noColorLiterals' | 'cursorAttached' | 'photosUnfiltered' | 'logoOnYellow' | 'usesTokens'; message: string }[]`
  - Template paths `/brand/templates/event-post.html` and `/brand/templates/fb-cover.html`. Both link `/brand/tokens.css`, logos under `/brand/logo/`, and the photo `/brand/photos/community-meetup.jpg`.

- [ ] **Step 1: Write the failing tests.** Each lint rule gets one passing and one failing fixture:
  - `noColorLiterals` flags `#abc`, `#AABBCC` and `rgb(` inside `style` and `<style>`.
  - `cursorAttached` flags any `.jc-cursor` whose parent isn't a `.jc-nw` containing at least one non-space character before the cursor. Fixture: `<h1>Ship it <span class="jc-cursor"></span></h1>` fails.
  - `photosUnfiltered` flags `filter` on any `img.jc-photo` or its ancestors.
  - `logoOnYellow` flags `lockup-light|lockup-dark|mark-color` used inside `.jc-poster` unless it's `sticker`.
  - `usesTokens` requires a `tokens.css` link.

  Then assert `lintHtml(read('templates/event-post.html'))`, `lintHtml(read('templates/fb-cover.html'))` and every `personality.exampleHtml` return `[]`. Also assert event-post contains an element with class `jc-event-line` whose text matches `/·.*·.*JSCEBU\.ORG/i`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement `lint.ts`** using linkedom's `parseHTML`.
- [ ] **Step 4: Write the templates.**
  - **event-post** (1080×1080, `.jc-poster`):
    - The sticker at the top right.
    - A mono label, then the headline (Archivo 900, uppercase) ending with `<span class="jc-nw">word<span class="jc-cursor" aria-hidden="true"></span></span>`.
    - Up to 3 agenda lines numbered `01`–`03` in mono.
    - A full-width ink bar with the `jc-event-line`.
    - Placeholders are marked with `<!-- EDIT: … -->` comments.
  - **fb-cover** (820×312 at 2× = 1640×624):
    - The unfiltered photo with a dark bottom gradient.
    - The sticker at the top right.
    - A caption at the bottom right: a mono label plus "Salamat, Cebu" with the cursor. Keep the bottom-left corner clear for the profile picture.
    - Check Facebook's current cover sizes and safe zones, and note the source in an HTML comment.
  - Fill the three `exampleHtml` snippets, each a minimal one-screen sample using `.jc-*` classes only.
- [ ] **Step 5: Run** the tests. Expected: PASS. Then screenshot both templates with headless Chrome at their native sizes and compare them with `docs/superpowers/specs/assets/2026-10-27-signature-v0.1.png`. The structure should match.
- [ ] **Step 6: Commit:** `feat(brand): add templates, HTML lint, examples`.

### Task 6: Website app: endpoints, Terminal layout and post-build checks

**Files:**
- Create: `apps/website/{package.json,astro.config.mjs,tsconfig.json,scripts/sync-brand.ts,scripts/check-dist.ts}`, `src/layouts/Terminal.astro`, `src/components/{Cursor,Sticker}.astro`, `src/pages/brand.md.ts`, `src/pages/brand/tokens.css.ts`, `src/pages/llms.txt.ts`, `src/pages/404.astro`, and a placeholder `src/pages/brand/index.astro`. The placeholder has an H1 through `<Cursor text="How JS Cebu looks" />` and `brand.must` as a plain `<ul>`, so the parity check has something to check.
- Dependencies:
  - `apps/website/package.json`: `"name": "website"`; deps `astro@7.4`, `@jscebu/brand@workspace:*`, `@fontsource-variable/{archivo,space-grotesk,inter-tight,jetbrains-mono}`; devDeps `tsx`, `linkedom`, `wrangler@4`, `vitest@5`.
- Modify: `.gitignore` (add `apps/website/public/brand/` and `apps/website/dist/`)
- Test: `apps/website/scripts/check-dist.ts` (runs in `build`) and `apps/website/test/check-dist.test.ts`

**Interfaces:**
- Consumes: `brand`, `tokensCss`, `brandMd`, `llmsTxt` (`@jscebu/brand`, as a `workspace:*` dependency imported from TS source). Also the asset and template files (Tasks 4–5).
- Produces:
  - `Cursor.astro` with props `{ text: string; blink?: boolean }`. It renders `text` with its last word wrapped as `<span class="jc-nw">{last}<span class="jc-cursor[ jc-cursor--blink]" aria-hidden="true"></span></span>`.
  - `Sticker.astro` with props `{ size: string; tilt?: number }` (default `-8`).
  - `Terminal.astro` with props `{ title: string; description: string }`. It injects `<style is:global set:html={tokensCss(brand)}>`, imports the four `@fontsource-variable` packages and sets `class="jc-terminal"` on `<body>`.
  - Build scripts: `predev`/`prebuild` → `tsx scripts/sync-brand.ts`, and `build` → `astro build && tsx scripts/check-dist.ts`.

- [ ] **Step 1: Write the failing tests** for `check-dist.ts`'s exported pure functions, using fixture strings:
  - `findCursorViolations(html)` returns `[]` for a correct cursor and 1 for a bare cursor.
  - `findMissingLinks(html, fileExists)` reports `/brand/logo/missing.svg`.
  - `findParityGaps(pageText, md, rules)` reports a rule missing from either source.
  - `findLiterals(srcFiles)` flags `color: #fff` and `font-family: Inter` but allows `var(--jc-*)`.
- [ ] **Step 2: Run** `pnpm --filter website test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Astro config per Global Constraints.
  - The endpoints return `new Response(text, { headers: { 'Content-Type': … } })` using the generators.
  - `sync-brand.ts` copies `packages/brand/assets/{logo,photos}` and `templates/` into `public/brand/`.
  - `check-dist.ts` reads `dist/` and runs all four checks over `dist/brand/index.html`, `dist/brand.md` and `apps/website/src/**`. It exits 1 with a list on any failure.
- [ ] **Step 4: Run** `pnpm --filter website test && pnpm --filter website build`. Expected: PASS, and `dist/` contains `brand/index.html`, `brand.md`, `brand/tokens.css`, `llms.txt`, `brand/logo/sticker.svg` and `brand/templates/event-post.html`.
- [ ] **Step 5: Commit:** `feat(website): add Astro app with brand endpoints`.

### Task 7: The /brand page, Cloudflare preview, public repo and the review checkpoint

**Files:**
- Create: `src/components/{Section,Swatch,PersonalityCard,RuleList}.astro`, `apps/website/{wrangler.jsonc,worker/index.ts,public/_headers}`
- Modify: `src/pages/brand/index.astro` (the full page)

**Interfaces:**
- Consumes: everything above.
- Produces: a deployed Worker named `jscebu-org` on workers.dev, and the GitHub repo `javascriptcebu/jscebu.org`.

- [ ] **Step 1: Build `/brand`** with the spec §5 sections in this order, each `<section id>`: `intro`, `logo`, `color`, `type`, `signatures`, `personalities`, `photos`, `voice`, `downloads`, `changelog`.
  - Intro: an H1 through `<Cursor text="How JS Cebu looks" blink />`, and a prominent "For agents → /brand.md" link with copy-to-clipboard.
  - Logo: each version shown on its intended background, plus `brand.logoRules`.
  - Type: specimens of the five fonts.
  - Personalities: each `exampleHtml` shown in an `<iframe srcdoc>`.
  - Photos: the fb-cover template in an iframe.
  - Voice: phrases with a visible "draft" badge.
  - Downloads: every `brand.assets` entry.
  - Everything is rendered from `brand`, with no copy hand-typed in the page except section intros. Mobile works at 320px.
- [ ] **Step 2: Run** `pnpm build`. Expected: `check-dist` passes. Screenshot at 1280px and 375px wide and review it against `docs/superpowers/specs/assets/2026-10-27-brand-page-sketch.png`.
- [ ] **Step 3: Configure Cloudflare.**
  - `wrangler.jsonc`: `name: "jscebu-org"`, `compatibility_date: "<today>"`, `main: "worker/index.ts"`, `assets: { directory: "./dist", binding: "ASSETS", not_found_handling: "404-page" }`, `workers_dev: true`, **no routes yet**.
  - The Worker's `fetch` returns `env.ASSETS.fetch(new URL('/404.html', request.url))` with status 404. It only runs on asset misses.
  - `public/_headers`:

```
/brand.md
  Content-Type: text/markdown; charset=utf-8
  Access-Control-Allow-Origin: *
/llms.txt
  Content-Type: text/plain; charset=utf-8
  Access-Control-Allow-Origin: *
/brand/*
  Access-Control-Allow-Origin: *
```

- [ ] **Step 4: Deploy the preview.** Load the `wrangler` skill, then run `npx wrangler whoami`. It must show the account that holds the `jscebu.org` zone. Then run `pnpm --filter website exec wrangler deploy`. Verify:
  - `curl -sI <workers.dev>/brand.md` → `200` with `content-type: text/markdown; charset=utf-8`
  - `/llms.txt`, `/brand/tokens.css` and `/brand/logo/sticker.svg` → `200`
  - `/nope` → `404`
- [ ] **Step 5: Publish the repo.** Run `gh repo create javascriptcebu/jscebu.org --public --source . --push`, then push `feat/brand-v0.1`. CI must pass.
- [ ] **Step 6: CHECKPOINT with Dorell.** Share the preview URL. Dorell approves or adjusts the fonts, the page, and each Bisaya phrase. Set approved phrases to `status: 'approved'`. Add the changelog entry `0.1.0` with today's date. Rebuild and redeploy the preview.
- [ ] **Step 7: Commit, then open a PR:** `feat(website): add /brand page and Cloudflare preview`. Merge after Dorell approves.

### Task 8: Put /brand live on www.jscebu.org without touching other pages

**Files:**
- Create: `scripts/legacy-check.sh`
- Modify: `apps/website/wrangler.jsonc` (add routes)

- [ ] **Step 1: Write `legacy-check.sh <outfile>`.** It prints `status content-type location` for each of these URLs:
  - `https://www.jscebu.org/{,events,official-links,members,mission-vision,iniatives,community-projects,robots.txt}`
  - `https://www.jscebu.org/api/social-image?id=67b39848cef94612b01ca6c1dc4d81a6`
  - The first `/_next/static/…` URL found on the homepage
  - `https://jscebu.org/` and `https://jscebu.org/brand`

  Run it to get `baseline.txt`, which is today's behavior.
- [ ] **Step 2: Check the zone's SSL/TLS mode** (dashboard, or `GET /zones/:id/settings/ssl`). It must be `full` or `strict` before `www` is proxied. If it's `flexible`, proxying Vercel will cause redirect loops. Plan a Configuration Rule for `www.jscebu.org` set to Full (strict), and don't change zone-wide settings without Dorell's say-so.
- [ ] **Step 3: CHECKPOINT.** Show Dorell the baseline, the SSL finding, the exact changes (proxy `www`, add 3 routes) and the rollback. Wait for an explicit "go".
- [ ] **Step 4: Proxy `www`.** Set the `www` CNAME (`cname.vercel-dns.com`) to Proxied. Run `legacy-check.sh after-proxy.txt`, then `diff baseline.txt after-proxy.txt`. Expected: no status or location differences.
- [ ] **Step 5: Add the routes and deploy.**

```jsonc
"routes": [
  { "pattern": "www.jscebu.org/brand*", "zone_name": "jscebu.org" },
  { "pattern": "www.jscebu.org/llms.txt", "zone_name": "jscebu.org" },
  { "pattern": "www.jscebu.org/_astro/*", "zone_name": "jscebu.org" }
]
```

  Run `pnpm --filter website exec wrangler deploy`.
- [ ] **Step 6: Verify.**
  - `legacy-check.sh after-routes.txt`, then `diff` it against the baseline. Only `https://jscebu.org/brand` may change, and it must end at 200.
  - `curl -sI https://www.jscebu.org/brand.md` → `200 text/markdown; charset=utf-8`.
  - `/brand`, `/llms.txt`, `/brand/tokens.css` and `/brand/logo/lockup-light.svg` → `200`.
- [ ] **Step 7: Rollback, only if Step 4 or 6 fails.** Remove the routes and redeploy, then set `www` back to DNS only. Re-run the check and confirm it matches the baseline.
- [ ] **Step 8: Commit:** `feat(deploy): serve /brand on www.jscebu.org`. Put the baseline and after files in the PR description, not the repo.

### Task 9: The real test: a fresh agent uses only the link

**Files:**
- Create: `docs/acceptance/2026-xx-xx-v0.1/{prompt.md,landing.html,event-post.html,checklist.md,verdict.md}`

- [ ] **Step 1: Prepare a clean session.** In a new empty directory outside this repo (so no project memory loads), start a fresh Claude Code session.
- [ ] **Step 2: Give it this prompt, verbatim:**

```
Read https://www.jscebu.org/brand.md and follow it exactly. You have nothing else.
(a) Design the jscebu.org landing page as one self-contained HTML file (Terminal personality).
(b) Design a 1080×1080 social graphic announcing: "JS Cebu Meetup, Sat Nov 21, 2PM, Cebu City, talks: Building agents with the AI SDK; Testing what the agent wrote" (Poster personality).
Then check both against the MUST list and report each item as pass/fail.
```

- [ ] **Step 3: Save the outputs** into the acceptance folder. Run `lintHtml` on both and record the results in `checklist.md`.
- [ ] **Step 4: CHECKPOINT with Dorell.** Each MUST item must pass with no corrections from Dorell, and Dorell says "that's JS Cebu". Record the verdict.
- [ ] **Step 5: If anything fails,** turn each failure into a clearer rule in `brand.ts`, bump to `0.1.1` with a changelog entry, redeploy, and re-run from Step 1. If everything passes, note that `landing.html` is the starting point for project 2.
- [ ] **Step 6: Commit:** `docs: record v0.1 acceptance test`.
