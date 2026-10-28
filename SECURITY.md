# Security Policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Report them privately instead:

- Email **hello@jscebu.org** with "Security" in the subject, or
- use GitHub's **Report a vulnerability** button on the repository's Security tab, if it's enabled.

Include:
- what you found and where (URL or file);
- how to reproduce it;
- the impact you expect.

JavaScript Cebu is run by volunteers. We aim to acknowledge reports within 7 days and to keep you updated until the issue is fixed. There is no bug bounty, but with your permission we're happy to credit you.

## Scope

- **In scope:**
  - www.jscebu.org and everything served from it (`/brand`, `brand.md`, `llms.txt`, `tokens.css`, the logo and template files);
  - the code in this repository;
  - its build and deploy configuration (`apps/website/wrangler.jsonc`, `.github/workflows/`).
- **Out of scope:**
  - other JS Cebu properties (builders.jscebu.org, ai.jscebu.org, hacktoberfest.jscebu.org);
  - third-party services (Cloudflare, GitHub, Facebook);
  - reports that only concern missing security headers on this static site, with no exploitable impact.

## Supported versions

Only the current `main` branch, which is what www.jscebu.org serves, receives fixes.

## Secrets

This repository is public and must never contain secrets. Deploy credentials live in Cloudflare and GitHub. If you spot a committed secret, report it privately as described above.
