# jscebu.org

Monorepo for [JavaScript Cebu](https://www.jscebu.org).

| Path | What it is |
|---|---|
| `packages/brand` | The JS Cebu design system: brand data, generators for `tokens.css` and `brand.md`, logos and templates |
| `apps/website` | The Astro site deployed to Cloudflare, starting with [jscebu.org/brand](https://www.jscebu.org/brand) |

- Brand guidelines: <https://www.jscebu.org/brand>
- For AI agents: <https://www.jscebu.org/brand.md>
- Design spec: [docs/superpowers/specs/2026-10-27-jscebu-design-system-design.md](docs/superpowers/specs/2026-10-27-jscebu-design-system-design.md)

## Develop

```sh
pnpm install
pnpm test
pnpm build
```

Code is MIT-licensed ([LICENSE](LICENSE)). The JS Cebu name and logos are not; see [packages/brand/LICENSE](packages/brand/LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) before changing the brand.
