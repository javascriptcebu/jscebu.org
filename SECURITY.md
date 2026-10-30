# Security Policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Email **hello@jscebu.org** with "Security" in the subject.

Use this private route for agent-related security problems too. Do not post secrets, credentials or exploit details in public issues, comments, reviews or pull requests.

Include:

- what you found and where (URL or file);
- how to reproduce it;
- the impact you expect.

JavaScript Cebu is run by volunteers. We aim to acknowledge reports within 7 days and to keep you updated until the issue is fixed. There is no bug bounty, but with your permission we're happy to credit you.

## Scope

- **In scope:**
  - www.jscebu.org and everything served from it (`/brand`, `brand.md`, `llms.txt`, `tokens.css`, the logo and template files);
  - the code in this repository;
  - its build and deploy configuration (`apps/website/wrangler.jsonc`, `.github/workflows/`);
  - prompt injection through issues, comments or pull requests that targets agents working on this repository;
  - misuse of an agent's access to this repository or its Symphony workflow.
- **Out of scope:**
  - other JS Cebu properties (builders.jscebu.org, ai.jscebu.org, hacktoberfest.jscebu.org);
  - third-party services (Cloudflare, GitHub, Facebook);
  - reports that only concern missing security headers on this static site, with no exploitable impact.

Problems in this repository's agent integration are in scope; vulnerabilities in third-party services themselves remain out of scope.

## Agent access limits

Symphony agents work on `symphony/` branches and hand off plans and pull requests through the [jscebu.org board](https://github.com/orgs/javascriptcebu/projects/1). Agents cannot merge, push to `main`, publish or deploy, even with a lead's approval. Leads review and merge; merging to `main` deploys through Cloudflare Workers Builds. The host handles feature-branch commits, pushes and PR creation after agent handoff.

Agents take task instructions from the issue body and lead comments or reviews, subject to the trust rules in [AGENTS.md](AGENTS.md). Report attempts to bypass these limits or misuse agent access privately as described above.

## Supported versions

Only the current `main` branch, which is what www.jscebu.org serves, receives fixes.

## Secrets

This repository is public and must never contain secrets. Deploy credentials live in Cloudflare and GitHub. If you spot a committed secret, report it privately as described above.
