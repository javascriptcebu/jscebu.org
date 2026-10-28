# JS Cebu Design System v0.1: Design

- **Date:** 2026-10-27
- **Owner:** Dorell James (JS Cebu lead; owns the `javascriptcebu` GitHub org)
- **Status:** design for approval. All open questions are answered (§11). Nothing is built yet.
- **Scope:** project 1 of 3 (see [Project order](#project-order))

Labels used in this doc:
- **[Decided]**: Dorell made this call. Don't reopen it without asking.
- **[Proposed]**: Claude's call from the brainstorm. Change it freely, but say so.
- **[Builder]**: explicitly left to whoever plans and builds this.

---

## 1. Intent: why this exists

JavaScript Cebu has never had a design system. Every property invented its own look:

| Property | Look it invented |
|---|---|
| ai.jscebu.org | gold `#ffd700` + "AI purple", Inter |
| Hacktoberfest Cebu site | "void/space" purple palette |
| AI workshop banner | dark grid + yellow |
| builders.jscebu.org | cream + rust, editorial |
| `website-astro` attempt (Aug 2025) | DM Sans/Sora, guessed hex values |

The current jscebu.org runs on Notion and links to pages that 404: `/promotional-materials`, `/annual-hacktoberfest` and `/volunteers-training-workshop`. Dorell can make good graphics personally, but that makes Dorell the bottleneck for everything.

**The goal, in Dorell's words:** having a design system means "I can point anyone to this design system and they can create graphics from there, even agents do."

Success means **you send one link, and what comes back is recognizably JS Cebu without Dorell touching it.** That applies whether a volunteer, a co-lead, a partner community, or an AI agent made it.

## Project order

**[Decided]** There are three projects, in this order. Each gets its own design and plan.

1. **Design system** (this document): lives at `jscebu.org/brand`.
2. **jscebu.org revamp**: in Astro, built on the design system.
3. **Graphics workflow**: how non-developers produce graphics easily. It might be Doop, code templates, or something else, and it consumes the design system rather than defining it.

## 2. Goals, non-goals, anti-goals

**Goals**
- A single link (`jscebu.org/brand`) with guidelines, logo downloads, and rules agents can read.
- Rules precise enough that a fresh AI agent, given only the link, produces on-brand work that Dorell doesn't need to correct.
- An identity recognizable as *JS Cebu*, not just "JavaScript."
- Versioned (v0.1), so future changes are deliberate releases rather than quiet drift.

**Non-goals for this project**
- The rest of the jscebu.org revamp (project 2). Existing Notion pages, including the broken ones, are not fixed here.
- A graphics tool for non-developers (project 3).
- Redesigning the logo.
- Brands for the sub-communities (React, Angular and Vue Cebu). **[Decided]** Those are part of JS Cebu's history, not its way forward.
- Hacktoberfest Cebu sub-brand rules. It's co-presented with other organizations, and handling it is an open question (§11).
- Merch, a mascot, a motion system.

**Anti-goals** (failure even if it technically ships)
- A nice-looking brand page whose rules are too vague to follow ("make it feel like JS Cebu").
- Over-unifying: one font, one layout and one decoration in three background colors. In the brainstorm this flattened the three personalities into a theme toggle, and Dorell lost confidence in it.
- Hexagons everywhere. **[Decided]** "I don't want to be fixated with hexagons." The hexagon is the logo, not a motif.
- The `/brand` page and the agent file drifting apart.
- Breaking any existing jscebu.org page while `/brand` goes live.
- Dorell still having to fix outputs by hand.

## 3. Constraints

- **[Decided]** Astro for the website. Hosted on **Cloudflare**.
- **[Decided]** A **monorepo** that keeps the parts separate (website, design system, and more later). Root: `~/Projects/mine/jscebu` (git initialized, no commits yet).
- **[Decided]** The system lives at **`jscebu.org/brand`**, with guidelines, logos, and agent-readable rules.
- DNS for jscebu.org is already on Cloudflare (`duke`/`pam.ns.cloudflare.com`, checked 2026-10-27). The apex `A 76.76.21.21` and `www → cname.vercel-dns.com` still serve the current Notion site on Vercel. `builders.` and `ai.` are already proxied through Cloudflare.
- Volunteers will maintain this. Keep it low-maintenance and avoid paid dependencies.
- Agents must be able to fetch everything **without auth**, at stable URLs.
- Fonts must be free and openly licensed (Google Fonts or OFL), so anyone and any agent can use them.

## 4. The identity: v0.1, locked "for now"

**[Decided]** Dorell locked this direction on 2026-10-27 ("let's lock to this one for now"). The reference image is `assets/2026-10-27-signature-v0.1.png`, and the original three personalities are in `assets/2026-10-27-personalities-original.png`.

### 4.1 Logo

**[Decided]** Keep the hexagon logo: a yellow-to-orange gradient ring around three curved panels that form "JS." The panel colors stay inside the full-color logo, but they are **not** system colors. Their old meaning (React, Vue and Angular) is history.

**Versions to produce** (SVG master plus PNG exports):

| Version | Use |
|---|---|
| Full-color mark | The source of the sticker |
| Flat lockup, light | Mark plus black "JAVASCRIPT / CEBU" wordmark, on light backgrounds |
| Flat lockup, dark | Mark plus white wordmark, on dark backgrounds |
| One-color mark and lockup, ink and white | Required on yellow backgrounds. The white separators and ring gap become **see-through**, so the background shows through the "JS" lines (prototyped and approved in the brainstorm). **[Proposed amendment, 2026-10-28, awaiting Dorell's confirmation]** On yellow, use **ink**: white on yellow is only 1.3:1. White one-color is for dark backgrounds and photos. |
| Sticker | The full-color mark with a white die-cut outline and an optional soft shadow (§4.3) |

**Source: the original PSD.** Dorell provided it on 2026-10-27, at `~/Downloads/js-cebu-logo.psd` (1166×1299, RGBA, sha256 `d7c26803…2ad2dab`).

**[Proposed]** Copy it into the repo at `packages/brand/source/js-cebu-logo.psd`.

What's inside, checked with `psd-tools`:
- **No vector paths.** Every shape is a raster layer, so the shapes still have to be traced.
- **The editable group (`Group 1`, hidden) was cropped at the canvas edge** when the file was saved. Its five layers (ring, white separators, and the three panels) are only partial shapes, so don't trace from them.
- **The complete mark is the flattened copy `Group 2 › Group 1 copy 2`** (1005×1006). This is the **ground truth** for shapes and colors.
- **The gradients are stored as live effects**, so the original intent is readable. Each gradient has a hidden leftover `#FF11DB` stop at 0%; ignore it.

  | Layer | Gradient | Settings |
  |---|---|---|
  | Ring | `#FF952E → #FFDF08` | 87°, scale 49% |
  | Blue panel | `#4C0E86 → #6BC6EC` | 61°, scale 49% |
  | Green panel | `#143826 → #7EC62B` | 90°, scale 62%, midpoint 35% |
  | Red panel | `#A233DB → #ED6B31` | 90°, scale 62%, midpoint 35% |

  The flattened ring reads `#FFDF00` at the top and `#FF8F00` at the bottom. Where the two disagree, the flattened pixels win.
- **The wordmark font is confirmed: Roboto Black.** It's the `CEBU.JS` text layer, and Roboto is a free Google Font. Hidden layers also show earlier attempts: "JS" in Arial Black and "javascript" in Arial Rounded MT Bold.

**[Builder]** Approach:
1. Separate the flattened mark into regions by color: ring, white gaps and separators, blue, green, red.
2. Trace each region on its own, for example with potrace, to get clean Bézier paths.
3. Rebuild the gradients as SVG `linearGradient`s using the values above.
4. Set the wordmark in **Roboto Black** and convert it to outlines. Don't trace the letters.
5. Check fidelity by overlaying the SVG on the flattened mark and on `javascriptcebu/ai-jscebu: public/js-horizontal.png` (5045×1284, the horizontal lockup).

Watch out: `javascriptcebu/jscebu: images/logo/logo.svg` is **not** the logo. It spells "Skeleton" and is left over from a template.

**Lockups.** Two have been used: the stacked **"CEBU.JS"** (2019, the PSD and the Facebook square) and the horizontal **"JAVASCRIPT / CEBU"** (2025 on: ai.jscebu.org and the AI workshop). **[Proposed]** The horizontal "JAVASCRIPT / CEBU" lockup is canonical, because it matches the community's name and recent use. "CEBU.JS" is retired as a legacy lockup.

**[Builder]** Clear space and minimum sizes.

### 4.2 Color

| Token | Value | Status |
|---|---|---|
| `yellow` | `#FFDF00` | **[Decided]** Yellow leads. **[Proposed]** The value is the top of the ring in the PSD's flattened mark. The brainstorm mockups used `#FED809`, sampled from a compressed PNG. This value replaces it. |
| `ink` | `#0E0F11` | **[Proposed]** |
| `paper` | `#F4F1EA` | **[Proposed]** |

- **[Builder]** A minimal set of supporting grays per personality, with every text/background pair checked against WCAG AA.
- **Never use yellow as a text color on paper.** It fails contrast.
- The logo's internal gradient colors (exact values in §4.1, from the PSD) are for the logo only.

### 4.3 Signatures: what makes it instantly JS Cebu

Yellow alone says "JavaScript." These signatures add "Cebu" and "this community." **[Decided]** Dorell ranked them in this order:

1. **The cursor** (top pick). The main headline of every piece ends with a solid block cursor.
   - **Size:** about 0.5em wide by 0.8em tall at the headline's size, sitting on the baseline.
   - **Color = the contrast color:** ink on yellow; yellow on ink or paper.
   - **It must never wrap alone.** Keep it with the last word (`white-space: nowrap` on the last word plus the cursor). This bug actually happened during the brainstorm.
   - On the web it blinks (about 1.05s, `steps(1)`), stays still under `prefers-reduced-motion`, and is `aria-hidden`. In images it doesn't blink.
   - **[Proposed]** Use one cursor per piece or screen, on the primary headline only, not every heading.
2. **The sticker** (second). The logo is shown as a tilted die-cut sticker: rotated 6–10° in either direction, with a white outline and an optional soft shadow. It's taken from laptop-sticker culture at meetups, and it can be printed as real stickers. A side benefit: the white edge keeps the logo's yellow ring visible on yellow backgrounds.
   - **[Proposed]** The sticker is for expressive moments: graphics, the hero, merch. Small functional spots (nav, footer, sponsor walls, small sizes) use the **flat** lockup.
   - **[Builder]** The exact outline thickness relative to the mark size.
3. **Bisaya voice** (experimental). **[Decided]** "Worth trying. I don't think I ever carried this as voice in the community." Keep it **light**: English first, with Bisaya in sign-offs, recaps and CTAs. Draft phrases: *Salamat* (thanks), *Kita-kits* (see you), *Padayon* (keep going), *Code ta!* (let's code), *Apil na* (join now). **[Proposed]** Bisaya never replaces essential information such as dates, venues, prices or instructions.
4. **Real photos.** **[Decided]** **No** yellow duotone or filters on photos of people. This builds on an existing habit: JS Cebu updates the facebook.com/javascriptcebu cover photo after every event. The system may only add on top of a photo: the sticker, a caption, and a dark gradient for legibility.
   - **[Proposed]** Make the post-event cover photo an official template (§6).

**[Decided]** No hexagon motifs beyond the logo: no hexagon number markers, no outlines.

### 4.4 Personalities

**[Decided]** There are three personalities, kept **distinct**: different typefaces, layouts and moods, not one style recolored. "Any of these can create a different look where appropriate." The signatures and yellow are what tie them together.

| Personality | Primary use | Look (from the brainstorm) |
|---|---|---|
| **Poster** | **[Decided]** Social media | Yellow background; heavy uppercase headline; mono metadata; an ink footer bar with the event details |
| **Terminal** | **[Decided]** The website | Ink background with a subtle grid; yellow headline; mono body and metadata; yellow primary button |
| **Journal** | **[Proposed]** Stories and recaps | Warm paper background; editorial rules; heavy sentence-case headline; a yellow highlighter band behind the key phrase; real photos |

**[Proposed]** Event graphics carry a mono **event line**, `WHEN · WHERE · jscebu.org` (for example `SAT NOV 21 · 2PM · CEBU CITY · JSCEBU.ORG`). This carries over from the "anchors" round, which Dorell approved apart from the hexagon details.

### 4.5 Type

**[Proposed]** These are placeholders from the brainstorm, not final picks:

| Role | Placeholder |
|---|---|
| Poster headlines and body | Archivo (900/600), chosen to echo the heavy wordmark |
| Terminal headlines | Space Grotesk (700) |
| Journal headlines | Inter Tight (800) |
| Labels, metadata, event line and code voice, in **every** personality | JetBrains Mono |

**[Builder]** Propose the final type set (free and openly licensed) and show it on `/brand` for Dorell's approval before v0.1 ships. Requirements:
- A heavy grotesque that sits well beside the wordmark.
- A mono shared across all personalities.
- Each personality's headline face clearly different from the others, so they don't collapse into one.

## 5. What gets delivered at jscebu.org/brand

**[Decided]** One link, with guidelines, logos, and agent-readable rules. The sketch is `assets/2026-10-27-brand-page-sketch.png`.

**`jscebu.org/brand`: the page people browse.** **[Proposed]** It's built in the Terminal personality, since it's part of the website. Sections:
1. Intro and version (v0.1), with a prominent "For agents" link.
2. Logo: versions, usage rules, downloads.
3. Color.
4. Type.
5. Signatures, in ranked order, each with do/don't examples.
6. Personalities: what each is for, plus a full example of each.
7. Photos and the post-event cover ritual.
8. Voice.
9. Templates and downloads.
10. Changelog.

**`jscebu.org/brand.md`: the same rules for agents.** **[Proposed]** A plain Markdown file at a stable URL, served as text. It contains:
- The version.
- A **MUST checklist**, written so an agent can check its own output against it (§7).
- Exact token values.
- A **complete recipe for each personality**: fonts with weights, sizes, layout, do/don't, and a minimal example HTML snippet.
- Voice rules.
- **Absolute URLs** for every asset.
- The changelog.

**[Proposed]** Also:
- `/llms.txt` at the site root, pointing to `/brand.md`.
- `/brand/tokens.css`, the CSS custom properties, so agents and tools can paste or link real values.

**Assets** at stable URLs under `/brand/…`: every logo version as SVG and PNG, and the templates.

**One source, two readers.** **[Proposed]** The page and `brand.md` are generated at build time from the same data in `packages/brand`, so they cannot disagree. **[Builder]** Add a build-time check that fails if any rule exists in one but not the other.

## 6. Templates (v0.1)

**[Proposed]** These are reference implementations. People and agents copy them. Making them easy for non-developers to fill in is project 3.

- **Event social post** (Poster), 1080×1080, plus a 4:5 variant if cheap. Contents: logo, label, headline with cursor, up to 3 agenda lines, event line.
- **Post-event cover photo** for the Facebook page: real photo, sticker, caption and cursor, with a dark gradient for legibility. **[Builder]** Check Facebook's current cover dimensions and safe zones, including where the profile picture overlaps and how mobile crops the image.
- **[Builder]** Template format: HTML/CSS that renders to PNG is the natural fit, since it's what agents produce and it reuses `tokens.css`.

## 7. MUST checklist (draft for brand.md)

An agent or person checks every piece against this list before sharing it:

- [ ] JS Cebu yellow `#FFDF00` appears.
- [ ] The logo is the sticker (tilted 6–10°, white die-cut edge), or the flat lockup in nav, footer, sponsor walls or small sizes.
- [ ] On a yellow background, any flat logo is the one-color version.
- [ ] The primary headline ends with a block cursor in the contrast color, and the cursor never wraps onto its own line.
- [ ] The piece uses one personality's recipe (Poster, Terminal or Journal), not a mix.
- [ ] It uses only the approved fonts.
- [ ] Photos are real and unfiltered.
- [ ] No hexagon shapes besides the logo.
- [ ] Event graphics include the mono event line with jscebu.org.
- [ ] Any Bisaya is in sign-offs, recaps or CTAs, never in place of essential information.

## 8. Architecture

**[Decided]** A monorepo on Astro and Cloudflare. **[Proposed]** Layout:

```
jscebu/                       (repo root, ~/Projects/mine/jscebu)
├─ apps/
│  └─ website/                Astro on Cloudflare. Routes: /brand, /brand.md, /brand/*, /llms.txt
├─ packages/
│  └─ brand/                  THE design system: rules and tokens as data, logo SVGs,
│                             templates, generators (CSS vars, brand.md)
└─ docs/superpowers/specs/    this document
```

- **[Proposed]** The website uses `packages/brand` the same way any outside tool would. Hard-coding a color or font in `apps/website` is a defect.
- **[Builder]**
  - Package manager and workspace tooling. pnpm workspaces is the obvious default.
  - Static output versus SSR.
  - Workers static assets versus Pages.
  - The repo name. **[Decided]** It's a **public** repo in the `javascriptcebu` org (§11).
- **Going live early.** `/brand` must go live **before** the rest of the revamp, **without breaking any existing jscebu.org page**.
  - **[Builder]** Choose the routing. For example, a Cloudflare Worker on `jscebu.org` serves the Astro site for `/brand*`, `/brand.md` and `/llms.txt` and proxies everything else to the existing Vercel deployment. Project 2 later removes that proxy.
  - Verify with `curl` that the old pages still return 200 before and after the switch.
- **Prior attempt.** The `javascriptcebu/website-astro` repo (an Astro starter plus a guessed token file) is **not** the base. Dorell chose the new monorepo. Its colors are guesses and shouldn't be reused as sources.

## 9. Acceptance: how we know it works

**[Decided]** "The real test after that is to design the landing page for the website and then a quick social media graphics for an event."

1. `jscebu.org/brand`, `jscebu.org/brand.md` and all logo assets are live on the real domain. Existing pages are unaffected.
2. Logo SVGs match the source PNG when overlaid.
3. All text/background pairs pass WCAG AA.
4. **The real test.** **[Proposed]** A fresh agent with no context from this brainstorm gets **only the `/brand` link** and designs:
   - (a) the jscebu.org landing page, in the Terminal personality;
   - (b) a quick social graphic for an event, in the Poster personality.

   It **passes** if both meet every MUST item without Dorell correcting them, and Dorell looks at them and says "that's JS Cebu." Any failure becomes a new or clearer rule in v0.1.x. The landing page design from (a) then becomes the starting point for project 2.

## 10. Left to the builder

These are marked [Builder] above:
- Final fonts (proposed for Dorell's approval).
- Supporting grays and the contrast matrix.
- The spacing and type scale.
- Logo clear space and minimum sizes.
- Sticker outline thickness and shadow.
- The SVG redraw method.
- Design of the `/brand` page within the Terminal personality.
- The exact structure of `brand.md`.
- Template file formats.
- Workspace tooling.
- Cloudflare routing during the transition.
- File and URL naming under `/brand/…`.

## 11. Open questions and settled minor calls

**Waiting on Dorell** (each changes what gets built):
1. ~~Does an original logo source exist?~~ **Answered:** yes, a PSD (§4.1). It's raster only, so the shapes are still traced, but it gives exact gradients, the confirmed wordmark font, and a clean 1005px master to trace from.
2. ~~Is the monorepo public on GitHub?~~ **[Decided] Yes, public**, under the `javascriptcebu` org. What that brings:
   - **[Proposed]** Licensing is split:
     - Code (website, generators, templates): **MIT**.
     - Brand assets (logos, the PSD, the name): **not** open-licensed. They stay © JavaScript Cebu and may be used as `/brand` describes, stated in `packages/brand/LICENSE` and on `/brand`. Fonts keep their own OFL/Apache licenses.
   - Add a short `CONTRIBUTING.md`. **[Builder]** Mention that brand changes are versioned releases (v0.1 → v0.2) with a changelog entry, not drive-by edits.
   - Nothing private goes in the repo: no form responses, no secrets, no Cloudflare tokens. Deploy credentials live in Cloudflare and GitHub secrets.
3. ~~Do the other leads sign off on v0.1 before it goes live?~~ **[Decided] No.** Dorell approves v0.1, including the fonts and any Bisaya copy, and launch needs no separate review step.

**Settled by Claude** (minor, change freely):
- Bisaya phrases are drafts. **Dorell approves all Bisaya copy** before it appears anywhere.
- Hacktoberfest Cebu stays outside v0.1 (§2). Revisit when planning Hacktoberfest 2027.
- The "fresh agent" in the test is a new Claude Code session with no project memory, given only `https://jscebu.org/brand`. Any capable agent works.
- The primary social size is 1080×1080, which works on Facebook, Instagram, X and LinkedIn. Facebook is the main channel today.
- Cloudflare: use the account that already holds the jscebu.org zone (it serves `builders.` and `ai.`). The plan starts by confirming access with `wrangler whoami`.

## Appendix A: research summary (2026-10-27)

- **Origins:** the GitHub org was created 2018-12-04. The 2019 launch page at cebu.js.org says the group "sprouted from" Laravel Cebu and Vue.js Cebu, in "the Queen City of the South."
- **Mission:** unite developers through meetups, codecamps and educational gatherings; "by the people and for the people."
- **Leads** (jscebu.org/members): Cyrus Hiyas (Angular Cebu), Dorell James (React Cebu), Harlequin Doyon (Vue.js Cebu), Sieg Balona (co-lead, React Cebu). "1k+ members."
- **Activity:**
  - Hacktoberfest Cebu: multi-community in 2020; Oct 5–26, 2025, co-presented with PizzaPy and ETHPH, with 7 gold sponsors.
  - Workshops: Automated Testing (May 2024), Volunteers Training (Aug 2024), AI-Powered Applications (2025).
  - Projects: Cebby, a PWA for Cebu tech events (talk on Nov 19, 2024); builders.jscebu.org (Sept 2026).
- **Channels:** facebook.com/javascriptcebu, x.com/JavaScriptCebu, github.com/javascriptcebu, hello@jscebu.org.
- **Brainstorm mockups:** `.superpowers/brainstorm/` (gitignored). The key screens are copied to `docs/superpowers/specs/assets/`.
