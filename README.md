# jscebu.org

The website and design system of [JavaScript Cebu](https://www.jscebu.org), live at <https://www.jscebu.org>.

| Path | What it is |
|---|---|
| `packages/brand` | The JS Cebu design system: brand data, the generators for `tokens.css`, `brand.md` and `llms.txt`, logos, templates and an HTML checker for the brand's MUST rules |
| `apps/website` | The Astro site: `/`, `/projects`, `/about`, `/links` and `/brand`. It deploys as the Cloudflare Worker `jscebu-org`, which serves www.jscebu.org |

- Brand guidelines: <https://www.jscebu.org/brand/>
- For AI agents: <https://www.jscebu.org/brand.md>
- Design specs: [design system](docs/superpowers/specs/2026-10-27-jscebu-design-system-design.md) · [site v1](docs/superpowers/specs/2026-10-28-jscebu-site-v1-design.md)

## How changes ship

1. Intent
2. Plan
3. Approval
4. Implementation
5. Review
6. Merge

**Merging to `main` deploys to production automatically** through Cloudflare Workers Builds. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Develop

```sh
pnpm install
pnpm test
pnpm build                      # builds the site and runs the post-build checks
pnpm --filter website dev       # local preview
```

Code is MIT-licensed ([LICENSE](LICENSE)). The JS Cebu name and logos are not; see [packages/brand/LICENSE](packages/brand/LICENSE).
