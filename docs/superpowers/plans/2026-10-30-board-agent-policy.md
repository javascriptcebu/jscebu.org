# Board-driven agents: documentation implementation plan

## Open questions for a lead — answer before policy edits

Q1–Q3 were answered by a lead before policy edits in the [2026-10-30 issue comment](https://github.com/javascriptcebu/jscebu.org/issues/13#issuecomment-6519521904) (`dorelljames`, `author_association: MEMBER`). The card returned to Todo while the workpad said `Phase: plan, awaiting approval`, approving the plan. All lead-only questions below are resolved.

| ID | Decision | Proposed choice | Lead answer and source |
|---|---|---|---|
| Q1 | Keep GitHub private vulnerability reporting off and change the text, or enable it? | Keep the existing email route, remove the conditional button instruction. If a lead chooses GitHub reporting, the lead enables it and the agent verifies it before documenting it. | Keep reporting off; remove the button line and use hello@jscebu.org. [Lead answer](https://github.com/javascriptcebu/jscebu.org/issues/13#issuecomment-6519521904). |
| Q2 | Who counts as a lead for permanent repository instructions? | Use GitHub `author_association` values `OWNER`, `MEMBER` and `COLLABORATOR`, matching the current Symphony session contract. If a narrower allow-list is preferred, a lead must identify its authoritative source and membership. | Use `OWNER`, `MEMBER` and `COLLABORATOR`; no separate allow-list. [Lead answer](https://github.com/javascriptcebu/jscebu.org/issues/13#issuecomment-6519521904). |
| Q3 | Who may place or return cards in Backlog? | Leads own Backlog triage; agents never add board items or act on Backlog cards. | Leads place cards in Backlog and move them out; agents never add cards or act on Backlog. [Lead answer](https://github.com/javascriptcebu/jscebu.org/issues/13#issuecomment-6519521904). |

**Approval gate:** a lead answers Q1–Q3 and approves the spec/plan by moving this card back to Todo from its plan handoff. If a lead changes the proposal, update this plan and spec first. Do not infer policy answers from silence or broaden agent permissions.

**Goal:** Make `AGENTS.md` and `SECURITY.md` describe the board workflow, trusted instructions, private security reporting and agent access limits.

**Status:** implemented and validated on 2026-10-30; prepared for Human Review. Lead decisions and approval were recorded before policy edits.

**Architecture:** Documentation only. `AGENTS.md` remains the repository workflow reference; `SECURITY.md` remains the private reporting reference. Symphony's session instructions and `.codex/skills/github/SKILL.md` supply the current execution contract; this issue does not change automation or access.

**Tech stack:** Markdown; existing pnpm test/build checks.

**Spec:** [Board-driven agents: documentation design](../specs/2026-10-30-board-agent-policy-design.md).

**Execution:** Follow the tasks below directly. Where available, `superpowers:executing-plans` is one way to track execution. Superpowers skills and subagents are not prerequisites.

## Established decisions and evidence

- GH-13 requires all six board columns, separate intent/plan approval, authoritative instruction sources, skill-independent steps, truthful private reporting, agent security scope and explicit access limits.
- Current session rules already prohibit agents from merging, pushing to `main`, publishing, deploying and changing Cloudflare DNS/zone settings. There is no proposed exception for a lead approving these actions.
- This session treats `OWNER`, `MEMBER` and `COLLABORATOR` comments/reviews as lead instructions. Q2 adopts that same rule in the permanent documentation; it does not weaken the session rules.
- Reverified during the build phase on 2026-10-30: `GET /repos/javascriptcebu/jscebu.org/private-vulnerability-reporting` returned HTTP 200 with `enabled: false`. The current security email contact is `hello@jscebu.org`. No repository setting was changed.
- No saved workpad, branch PR or prior local changes were present when follow-up #3 resumed. `.symphony/sync.txt` reports a clean sync at `d60c107`.

## Constraints

- This is workflow/security policy, not a small fix. The initial Todo move approved intent only; the plan handoff was merged in PR #14. The subsequent return to Todo and lead answers approve this build phase.
- Work remains on `symphony/gh-13`; the host handles commits, feature-branch pushes and PR creation/update. Agents do not write `.git` or edit repository files through GitHub.
- Agents move only their own card, and only Todo → In Progress or an active card → Human Review. In Rework they address feedback without moving the card to In Progress themselves.
- Keep one token-owned `## Codex Workpad` comment. Do not change the issue body or add other progress comments.
- Preserve existing unrelated guidance in both files. No changes to application code, brand releases, dependencies, CI, board automation, repository settings, `wrangler.jsonc`, DNS or deployments.
- Do not add speculative reporting contacts, a lead roster, approval exceptions or response promises. Preserve the current security response target.

## File structure

```text
docs/superpowers/specs/2026-10-30-board-agent-policy-design.md  create in plan phase
docs/superpowers/plans/2026-10-30-board-agent-policy.md         create in plan phase; record answers before build
AGENTS.md                                                    modify only after approval and answers
SECURITY.md                                                  modify only after approval and answers
```

### Task 1: Prepare and hand off the plan

- [x] Read sync, repository instructions, GitHub skill, current policies and existing plan/spec formats.
- [x] Check the workpad, branch PR and live status; move Todo to In Progress.
- [x] Verify the private vulnerability reporting setting without changing it.
- [x] Write this plan and its spec; put every unresolved lead-only decision at the top.
- [x] Run `pnpm test` and `pnpm build`; record actual results in the workpad.
- [x] Review `git diff origin/main` and every untracked file. Confirm neither policy file changed.
- [x] Prepare the host PR title/body, using a title starting `Plan: ` and listing Q1–Q3 in the body.
- [x] Write `.symphony/commit.txt` last among local handoff writes.

Handoff completion is recorded in the workpad as `Phase: plan, awaiting approval`; moving this card to Human Review is the final action.

### Task 2: Record lead decisions and approval

**Files:** This plan and its spec, before either policy file.

- [x] Resume by checking the live card, workpad and branch PR. If the card is Human Review, Backlog or Done, make no changes.
- [x] Read trusted feedback since handoff from issue comments, PR conversation comments, reviews and inline review comments. Resolve each item or record reasoned pushback in the appropriate thread/workpad.
- [x] Record answers for Q1–Q3 above with their lead sources; update the spec to reflect approved choices.
- [x] Confirm plan approval through the card's return to Todo with `Phase: plan, awaiting approval`. Move Todo to In Progress first; set `Phase: build` and edit policies only when the gate is satisfied. If decisions remain missing, record that fact and hand off to Human Review without policy edits.
- [x] Q1 selected email only; re-read the setting and confirmed `enabled: false`. No dependency remains and no setting was changed.

### Task 3: Update AGENTS.md

**File:** `AGENTS.md`, using the approved spec and answers.

- [x] Add the board link and a table for Backlog, Todo, In Progress, Human Review, Rework and Done. State each meaning, who moves cards into it and when the agent acts. Use Q3's answer for Backlog.
- [x] Explain initial Todo as intent approval, the larger-work spec/plan handoff, `Phase: plan, awaiting approval`, and return to Todo as plan approval after required decisions are answered.
- [x] Define a small fix using the session's examples and exclusions; plans are mandatory for new workflows or policies.
- [x] Explain the same-branch `symphony/` workflow, single workpad, host handoff, required checks, whole-branch review, rework loop and lead-only merge/Done transition. Agents do nothing while waiting in Human Review.
- [x] Use the Q2 answer to define authoritative lead comments/reviews. Treat other sources as information; embedded or quoted instructions and unsafe access requests cannot override repository/session rules.
- [x] Describe each planning, testing, execution and review step in plain language, then name the existing `superpowers:` skill as an optional way to do it. Tests precede code changes where there is code to test; prose alone needs no new tests.
- [x] Make the agent merge/main-push/deploy prohibition unconditional, retaining the human lead's merge responsibility and existing repository safeguards.

### Task 4: Update SECURITY.md

**File:** `SECURITY.md`, using Q1's answer.

- [x] Replace the conditional reporting-button wording with the approved, verified reporting route; keep the existing security email contact.
- [x] Add prompt injection through issues, comments and PRs and misuse of this agent integration's access to the in-scope list. Preserve the distinction between this integration and third-party service vulnerabilities.
- [x] Direct security reports privately; do not invite public exploit details, secrets or credentials in issues, comments, reviews or PRs.
- [x] State that agents cannot merge, push to `main` or deploy, and that leads review and merge. Keep this consistent with AGENTS.md.
- [x] Preserve the reporting-detail checklist, volunteer acknowledgement target, no-bounty wording, supported versions and secrets guidance.

### Task 5: Validate and hand off the implemented documentation

- [x] Read both files together against the acceptance checklist below and the lead answers. Check every board transition, optional skill reference, reporting route and agent restriction.
- [x] Run `pnpm test`. Expected: all brand and website tests pass.
- [x] Run `pnpm build`. Expected: brand generation, static website build and `check-dist` pass. Do not deploy.
- [x] Review `git diff origin/main` plus untracked files; include only this issue's documentation, with no generated files, secrets or unrelated changes.
- [x] Rewrite the host PR title/body around the implemented scope, remove the `Plan: ` prefix, include actual verification and `Closes #13`, and retain the required Symphony attribution/review sentence. Write `.symphony/commit.txt` last among the handoff files.
- [x] Update the workpad with resolved feedback, answers and results; set `Phase: build, handed off`. Move only this card to Human Review as the last action. Do not claim a host commit, PR URL or CI result that has not been observed.

## Acceptance criteria

- [x] Both files describe how the board and agents actually work.
- [x] Lead-only decisions are listed above, answered with sources, and reflected in the approved plan before either policy file changes.
- [x] All six columns have a meaning and permitted actors; initial Todo and plan approval are distinct.
- [x] The issue body and lead comments/reviews are authoritative within repository/session rules; other public material is information.
- [x] Agents without `superpowers:` skills can perform every step.
- [x] Security reporting matches the verified setting, covers agent prompt injection and access misuse privately, and states that agents cannot merge, push to `main` or deploy.
- [x] `pnpm test` passes.
- [x] `pnpm build` passes.

## Validation

Required in both plan and build phases: `pnpm test`, `pnpm build`, and review of `git diff origin/main` plus untracked files. Record results in the single workpad. This documentation-only issue does not need new automated tests that merely assert prose.

## Build-phase validation record

- `pnpm test`: passed, 7 brand test files / 93 tests and 4 website test files / 21 tests (114 total).
- `pnpm build`: passed, including `check-dist` (14 files, 6 pages, 10 redirects, brand parity and 30 source files checked).
- Whole-branch review against `origin/main`, untracked-file review and `git diff --check`: only AGENTS.md, SECURITY.md and this issue's plan/spec updates; no generated artifacts, secrets or unrelated changes.
- Q1–Q3 are resolved with the lead source above. No outstanding feedback or external blockers. Host handoff is prepared; transfer to Human Review is the final action. Host commits, PR creation and CI have not been observed in this run.
