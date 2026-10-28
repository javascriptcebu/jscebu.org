# jscebu.org v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the jscebu.org landing page plus `/projects` (Cebby), `/about` and `/links` on the existing Astro app, redirect every old Notion URL, and swap www.jscebu.org to the `jscebu-org` Worker.

**Architecture:**
- The app is the static Astro 7 site in `apps/website`.
- Content lives in Markdown/JSON content collections, validated with zod schemas.
- All pages share a `Site` layout (nav and footer) on top of the existing `Terminal` layout.
- Old URLs are redirected by a `_redirects` file that Workers static assets applies before asset matching.
- `check-dist` grows to cover every built page.
- The swap attaches `www.jscebu.org` to the Worker as a Custom Domain.

**Tech Stack:** Astro 7.4 (content layer: `glob` and `file` loaders from `astro/loaders`, zod from `astro/zod`), Vitest 5, Wrangler 4, linkedom.

**Spec:** `docs/superpowers/specs/2026-10-28-jscebu-site-v1-design.md`. It builds on `docs/superpowers/specs/2026-10-27-jscebu-design-system-design.md`.

## Global Constraints

- Every page uses the Terminal personality. There must be no hex, `rgb()`, `hsl()` or font-family literals in `apps/website/src`; `check-dist` enforces this.
- The primary headline on each page ends with `<Cursor>`, wrapped in `.jc-nw`. There is one cursor per page, and only the landing hero's cursor blinks.
- No Bisaya copy until Dorell approves the phrases.
- Content comes from the current site:
  - Mission and vision, verbatim from `/mission-vision`.
  - The four leads, from `/members`.
  - The channels, from `/official-links`.
  - Cebby's description: "Cebby is a public discovery layer for Cebu tech events", linking https://www.getcebby.com and https://github.com/getcebby/cebby.
- The upcoming-events links are https://www.getcebby.com and https://www.facebook.com/JavaScriptCebu/events.
- There is no blog link, because blog.jscebu.org returns 403.
- Work happens on branch `feat/site-v1`, stacked on `feat/brand-v0.1`. The PR targets `feat/brand-v0.1` until PR #1 merges.
- Commit messages: an imperative subject of about 50 characters; the body has one line per paragraph with no hard wrapping.
- **Outward actions:**
  - The workers.dev preview deploy is approved.
  - Deleting the www DNS record and attaching the custom domain each need Dorell's explicit "go".

## Review Focus

1. **Someone following an old link** (`/members`, `/iniatives`, `/events`, the three Notion "page not found" pages): they must land on the target in spec §5 with its status. A redirect into a 404 is a failure. Owners: Task 4 (`_redirects` table test) and Tasks 5–6 (live URL matrix).
2. **A visitor on a 320px phone:** no horizontal scroll on `/`, `/projects`, `/about`, `/links`, `/brand`. Owner: Task 5 (iframe harness, since headless Chrome won't lay out below 500px).
3. **A nav or footer link to a path that doesn't exist:** the build must fail. Owner: Task 4 (`findMissingLinks` over every page, with no "ours" filter, and redirect sources counting as missing).
4. **An agent fetching `/brand.md` after the swap:** it must still get `text/markdown; charset=utf-8` with CORS. Owner: Task 6.
5. **The swap gap:** between deleting the CNAME and attaching the domain, www is down. The rollback commands must be written down and tested for syntax before the "go". Owner: Task 6.

---

## File Structure

```
apps/website/
  src/content.config.ts             collections: projects, organizers, links, pages
  src/content/schemas.ts            zod schemas (shared by config and tests)
  src/content/projects/cebby.md     src/content/organizers.json   src/content/links.json
  src/content/pages/about.md
  src/assets/projects/cebby.png     Cebby icon (copied from getcebby/cebby)
  src/layouts/Site.astro            Terminal + SiteNav + slot + SiteFooter
  src/components/SiteNav.astro  SiteFooter.astro  ProjectCard.astro
  src/pages/index.astro  projects.astro  about.astro  links.astro  sitemap.xml.ts  robots.txt.ts
  public/_redirects
  scripts/check-dist.ts             all pages; parseRedirects
  scripts/url-matrix.sh             old/new URL checks against a base URL
  test/content.test.ts  test/redirects.test.ts
```

---

### Task 1: Content collections and data

**Files:** Create `src/content.config.ts`, `src/content/schemas.ts`, the content files above and `src/assets/projects/cebby.png`. Test: `test/content.test.ts`.

**Interfaces (produces):**
- `projectSchema({ image })`:
  - `name: string`, `url: url`, `repo?: url`, `summary: string`
  - `image: image()`
  - `status: 'active' | 'archived'`, `featured: boolean`, `order: number`
- `organizerSchema`: `{ id, name, role, community?, order }`. The `file()` loader needs an `id` per entry.
- `linkSchema`: `{ id, label, url, handle?, order }`.
- `pageSchema`: `{ title, description }`.
- `collections = { projects: glob('**/*.md', base: 'src/content/projects'), organizers: file('src/content/organizers.json'), links: file('src/content/links.json'), pages: glob('**/*.md', base: 'src/content/pages') }`.

- [ ] **Step 1: Write the failing test.** `content.test.ts` reads the JSON files and the frontmatter of each Markdown file. It parses them with the schemas; for the image field, a stub `z.string()` stands in. Assert:
  - The organizers are exactly Cyrus Hiyas, Dorell James, Harlequin Doyon and Sieg Balona, with roles Lead, Lead, Lead, Co-Lead, in that order.
  - The links include `https://www.facebook.com/JavaScriptCebu/`, `https://twitter.com/javascriptcebu`, `https://github.com/javascriptcebu/` and `mailto:hello@jscebu.org`.
  - The only project is Cebby (`featured: true`, url `https://www.getcebby.com`).
  - `about.md` contains the mission's first sentence verbatim: "JavaScript Cebu aims to empower and unite developers".
- [ ] **Step 2: Run** `pnpm --filter website test`. Expected: FAIL (the schemas module is missing).
- [ ] **Step 3: Implement** the schemas, config and data.
  - `about.md` holds the Mission, Vision and "How we measure success" sections verbatim, plus a short History section (spec §3).
  - Copy Cebby's icon from `~/Projects/cebby/apps/pwa/public/` (choose the largest PNG app icon).
- [ ] **Step 4: Run** the tests, then `pnpm --filter website build`. Expected: PASS, and Astro reports the 4 collections.
- [ ] **Step 5: Commit:** `feat(website): add content collections for the site`.

### Task 2: Shared layout, and the /projects, /about and /links pages

**Files:** Create `src/layouts/Site.astro`, `src/components/{SiteNav,SiteFooter,ProjectCard}.astro`, and `src/pages/{projects,about,links}.astro`. Modify `src/pages/brand/index.astro` and `src/pages/404.astro` to use `Site`.

**Interfaces:**
- `Site.astro` props: `{ title: string; description: string; current?: 'home' | 'projects' | 'about' | 'links' | 'brand' }`.
  - It renders `Terminal`, then `SiteNav`, a `<main>` slot, and `SiteFooter`.
- `SiteNav`:
  - The lockup-dark logo links to `/`. Then the links Projects, About, Brand.
  - `aria-current="page"` on the current link.
  - It collapses to the logo plus links on one line from 320px up; no hamburger menu.
- `/brand` keeps its section links as a second row under `SiteNav`, and keeps its `brand.md` link.
- `SiteFooter`:
  - Links to Projects, About, Links, Brand, `/brand.md`, the GitHub repo and `/llms.txt`.
  - The license sentence from `/brand`'s footer.
- `ProjectCard` props: `{ entry: CollectionEntry<'projects'> }`.
- Each page's H1 ends with `<Cursor>` (non-blinking):
  - `/projects` "Community projects"
  - `/about` "About JS Cebu"
  - `/links` "Find JS Cebu"

- [ ] **Step 1:** Build the layout and pages from the collections (`getCollection`, `render`).
- [ ] **Step 2: Run** `pnpm --filter website build`. Expected: `check-dist` passes, including `/brand` parity.
- [ ] **Step 3: Commit:** `feat(website): add site layout and about, links, projects`.

### Task 3: The landing page

**Files:** Create `src/pages/index.astro`.

- [ ] **Step 1:** Build `/` with `Site` (`current: 'home'`). Sections, in order, with these ids:
  - `hero`:
    - The label `// cebu's javascript community`.
    - The H1 `<Cursor text="Build things. Ship them. Together" blink />`.
    - One line: "Meetups, workshops and Hacktoberfest, run by developers in Cebu."
    - Buttons: "Upcoming events ↓" (`#events`) and "Join us" (`#join`).
    - `<Sticker>` on the right on desktop, in the flow on mobile, as on `/brand`.
  - `what-we-do`: three cards (Meetups, Workshops, Hacktoberfest Cebu), each one line. Hacktoberfest links to `https://hacktoberfest.jscebu.org`.
  - `events`: a heading, one line saying events are listed on Cebby, and buttons to Cebby (primary) and Facebook events.
  - `projects`: the featured project's `ProjectCard`, plus a link to `/projects`.
  - `community`: the real community photo (`.jc-photo`, unfiltered, `/brand/photos/community-meetup.jpg`), with a mono caption.
  - `join`: the `links` collection as buttons.
- [ ] **Step 2: Run** `pnpm --filter website build`. Expected: PASS.
- [ ] **Step 3: Commit:** `feat(website): add the landing page`.

### Task 4: Every page checked, redirects, sitemap

**Files:** Modify `scripts/check-dist.ts`. Create `public/_redirects`, `src/pages/{sitemap.xml,robots.txt}.ts` and `test/redirects.test.ts`. Modify `test/check-dist.test.ts`.

**Interfaces:**
- `parseRedirects(text: string): { from: string; to: string; status: number }[]`. Comments and blank lines are skipped; the status defaults to 302.
- `findMissingLinks(text, fileExists)` checks every root-relative and `https://www.jscebu.org/…` path; the "ours" filter is removed. Redirect sources are not files, so linking to one counts as missing.
- `check-dist` runs the cursor and link checks over every `dist/**/*.html`, `brand.md` and `llms.txt`. Parity stays on `/brand`, and the literal check stays on `src/**`. It also checks that every redirect target that is a path on this site exists.

- [ ] **Step 1: Write the failing tests.**
  - `redirects.test.ts` reads `public/_redirects` and asserts it equals spec §5, row for row:
    - `/mission-vision` → `/about` 301
    - `/members` → `/about#organizers` 301
    - `/iniatives` → `/about` 301
    - `/initiatives` → `/about` 301
    - `/official-links` → `/links` 301
    - `/community-projects` → `/projects` 301
    - `/events` → `/#events` 302
    - `/promotional-materials` → `/brand` 301
    - `/annual-hacktoberfest` → `https://hacktoberfest.jscebu.org` 301
    - `/volunteers-training-workshop` → `/about` 301
  - In `check-dist.test.ts`, replace the "ignores pages the legacy site serves" case with: `/events` is reported missing when it isn't a file.
- [ ] **Step 2: Run** `pnpm --filter website test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `sitemap.xml` lists `/`, `/projects`, `/about`, `/links` and `/brand/` as absolute URLs.
  - `robots.txt` allows everything and points to the sitemap.
- [ ] **Step 4: Run** `pnpm test && pnpm --filter website build`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(website): redirect old URLs and check every page`.

### Task 5: Preview on workers.dev (CHECKPOINT: Dorell reviews)

**Files:** Create `scripts/url-matrix.sh`.

- [ ] **Step 1:** Write `scripts/url-matrix.sh BASE`. It curls each row of spec §5 without following redirects and checks the status and `Location`. It also checks:
  - `/`, `/projects`, `/about`, `/links` and `/brand/` return 200.
  - `/brand.md` returns 200 with `text/markdown; charset=utf-8` and `access-control-allow-origin: *`.
  - `/nope` returns 404.
  - It prints one line per check and exits 1 on any mismatch.
- [ ] **Step 2: Run** it against `npx wrangler dev --local`. Expected: all pass.
- [ ] **Step 3: Deploy the preview.** Run `pnpm --filter website build && pnpm --filter website exec wrangler deploy`. Then run `scripts/url-matrix.sh https://jscebu-org.<subdomain>.workers.dev`. Expected: all pass.
- [ ] **Step 4:** Screenshot `/`, `/projects`, `/about` and `/links` at 1280px, and at a true 320px through the iframe harness, with reduced motion forced. Check for no horizontal scroll and a visible cursor.
- [ ] **Step 5:** Push, then open a PR from `feat/site-v1` into `feat/brand-v0.1`.
- [ ] **CHECKPOINT:** share the preview URL. Dorell approves the copy and the pages, or asks for changes.

### Task 6: Swap www.jscebu.org (CHECKPOINT: explicit "go")

- [ ] **Step 1: Pre-flight (read-only).**
  - `npx wrangler whoami` shows the account.
  - Confirm the `jscebu.org` zone is in it, using the Cloudflare dashboard or an API zone listing with that account.
  - Record the current DNS records for `www` and the apex in the ledger.
  - Write the rollback commands into the ledger.
- [ ] **Step 2: CHECKPOINT.** Get Dorell's "go" for the swap window.
- [ ] **Step 3: Delete the www CNAME** (`cname.vercel-dns.com`). Use the API if wrangler's token has DNS edit; otherwise Dorell deletes it in the dashboard.
- [ ] **Step 4: Attach the domain.** Add `"routes": [{ "pattern": "www.jscebu.org", "custom_domain": true }]` to `wrangler.jsonc` and replace the "no routes yet" comment. Then run `wrangler deploy`.
- [ ] **Step 5: Verify.** Run `scripts/url-matrix.sh https://www.jscebu.org` until it passes. Certificate issuance can take a few minutes.
  - Also check that `https://jscebu.org` still returns `308 → https://www.jscebu.org/` from Vercel.
  - If www isn't serving within 15 minutes, roll back.
- [ ] **Step 6: Commit:** `feat(website): serve www.jscebu.org from the Worker`. Update project memory with the launch date and the follow-ups:
  - Retire Vercel and Notion, and move the apex redirect to Cloudflare.
  - Remove www from the Vercel project.
  - Workers Builds auto-deploy.
  - The Cebby events endpoint.
  - Design-system Task 9 against the live `/brand`.
