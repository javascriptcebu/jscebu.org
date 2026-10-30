# Board-driven agents: documentation implementation plan

## Decisions for a lead

All decisions are resolved. A [lead answered the original questions](https://github.com/javascriptcebu/jscebu.org/issues/13#issuecomment-6519521904) (`dorelljames`, `MEMBER`) before either policy changed, and returned the plan-phase card to Todo to approve implementation after PR #14 merged the plan. The choices below record those answers; they are not new questions.

1. **Keep private vulnerability reporting off, or enable it?** Resolved: keep it off, remove the conditional button instruction and use hello@jscebu.org. The build-phase API check on 2026-10-30 returned `enabled: false`; no setting changed.
2. **Who counts as a lead?** Resolved: use `author_association` values `OWNER`, `MEMBER` and `COLLABORATOR`, with no separate allow-list.
3. **Who owns Backlog triage?** Resolved: leads place cards in Backlog and move them out; agents never add cards or act on Backlog.

The [lead's Rework request](https://github.com/javascriptcebu/jscebu.org/pull/15#issuecomment-6535717145) (`dorelljames`, `MEMBER`) approves these workflow updates directly: append-only issue updates and a local checklist; the `cebu-symphony[bot]` App identity and access limits; plan/blocked PR warnings with `Refs`; and numbered questions with lettered options, one recommended, accepted when a lead returns the card to Todo without a reply. Record explicit answers or accepted recommendations and their approval source before implementation. No new lead-only decisions remain.

## What changes

- `AGENTS.md`: describe all six board columns, actors, intent/plan approval and Rework, preserving the existing safeguards and optional skill equivalents.
- `AGENTS.md`: replace editable issue workpads with append-only start, handoff and blocked updates; keep the checklist in ignored `.symphony/workpad.md` and include it in each handoff.
- Both policies: explain the App identity, read-only code tokens, host feature-branch SSH pushes and unconditional agent merge/main-push/deploy prohibition. App comments are agent output, never lead instructions.
- `AGENTS.md`: require numbered questions with lettered options and one recommendation; plan/blocked PRs start with “Don't merge this yet” and use `Refs #N`, while only complete builds use `Closes #N`.
- `SECURITY.md`: retain private email reporting and include prompt injection and misuse of agent access; align the spec with the current workflow.

## Tasks

1. **Record approval and feedback — this plan and [the spec](../specs/2026-10-30-board-agent-policy-design.md).** Record lead sources before policy edits, then align workflow descriptions with the lead's Rework request. Check that no unanswered lead-only decision remains. Original plan and build handoffs completed on 2026-10-30; Rework resumes on the same branch.
2. **Update `AGENTS.md`.** Document the board and independent planning/testing/review steps. Use `## Codex update` or `## Claude update` comments for start, handoff and blocked events, never editing or deleting posted comments; old workpads are history. Describe the local checklist, lead decision defaults, App identity, host handoff files and PR warning/reference rules. Verify each lead item against the final prose.
3. **Update `SECURITY.md`.** Preserve hello@jscebu.org, reporting guidance and agent security scope. Align identity, API limits and host responsibilities with AGENTS.md. Read both policies together for consistency; do not change repository settings or access.
4. **Validate and review — all four Markdown files.** Run `pnpm install --frozen-lockfile`, `pnpm test` and `pnpm build`; inspect `git diff origin/main`, untracked files and whitespace for scope, correctness and secrets. Prose alone needs no new tests. Resolve every lead request and host-review must-fix; optional suggestions may be deferred with reasons in the local workpad.
5. **Hand off — ignored `.symphony/` files and issue update.** Record checks, feedback and notes in `.symphony/workpad.md`. Write the PR title/body and write `commit.txt` last. Plan or blocked PRs begin “Don't merge this yet” and use `Refs #13`; only a complete build uses `Closes #13`. Include Symphony attribution and required lead review, post a new handoff update with the local checklist folded into it, then move only this card to Human Review as the last action. The host handles commits, feature-branch pushes and PR updates; agents do not write `.git`, merge or deploy.

Original build validation on 2026-10-30 passed: 114 tests (93 brand, 21 website), build and check-dist (14 files, 6 pages, 10 redirects, brand parity, 30 source files). Checks must run again for Rework; current results and feedback resolutions belong in the local workpad and handoff update.
