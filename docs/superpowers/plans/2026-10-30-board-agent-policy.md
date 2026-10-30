# Board-driven agents: documentation implementation plan

## Open questions for a lead — answer before policy edits

All answers are pending. Record each answer and its lead issue-comment or review reference here before changing `AGENTS.md` or `SECURITY.md`. Returning the card to Todo approves this plan, but does not supply missing policy answers.

| ID | Decision | Proposed choice | Lead answer and source |
|---|---|---|---|
| Q1 | Keep GitHub private vulnerability reporting off and change the text, or enable it? | Keep the existing email route, remove the conditional button instruction. If a lead chooses GitHub reporting, the lead enables it and the agent verifies it before documenting it. | Pending |
| Q2 | Who counts as a lead for permanent repository instructions? | Use GitHub `author_association` values `OWNER`, `MEMBER` and `COLLABORATOR`, matching the current Symphony session contract. If a narrower allow-list is preferred, a lead must identify its authoritative source and membership. | Pending |
| Q3 | Who may place or return cards in Backlog? | Leads own Backlog triage; agents never add board items or act on Backlog cards. | Pending |

**Approval gate:** a lead answers Q1–Q3 and approves the spec/plan by moving this card back to Todo from its plan handoff. If a lead changes the proposal, update this plan and spec first. Do not infer policy answers from silence or broaden agent permissions.

**Goal:** Make `AGENTS.md` and `SECURITY.md` describe the board workflow, trusted instructions, private security reporting and agent access limits.

**Status:** plan phase, awaiting lead decisions and approval. Neither policy file has changed.

**Architecture:** Documentation only. `AGENTS.md` remains the repository workflow reference; `SECURITY.md` remains the private reporting reference. Symphony's session instructions and `.codex/skills/github/SKILL.md` supply the current execution contract; this issue does not change automation or access.

**Tech stack:** Markdown; existing pnpm test/build checks.

**Spec:** [Board-driven agents: documentation design](../specs/2026-10-30-board-agent-policy-design.md).

**Execution:** Follow the tasks below directly. Where available, `superpowers:executing-plans` is one way to track execution. Superpowers skills and subagents are not prerequisites.

## Established decisions and evidence

- GH-13 requires all six board columns, separate intent/plan approval, authoritative instruction sources, skill-independent steps, truthful private reporting, agent security scope and explicit access limits.
- Current session rules already prohibit agents from merging, pushing to `main`, publishing, deploying and changing Cloudflare DNS/zone settings. There is no proposed exception for a lead approving these actions.
- This session treats `OWNER`, `MEMBER` and `COLLABORATOR` comments/reviews as lead instructions. Q2 asks whether to adopt that rule permanently in the repository documentation; it does not weaken the current session rules.
- On 2026-10-30, `GET /repos/javascriptcebu/jscebu.org/private-vulnerability-reporting` returned HTTP 200 with `enabled: false`. The current security email contact is `hello@jscebu.org`. No repository setting was changed.
- No saved workpad, branch PR or prior local changes were present when follow-up #3 resumed. `.symphony/sync.txt` reports a clean sync at `d60c107`.

## Constraints

- This is workflow/security policy, not a small fix. The current Todo move approved intent only. This handoff contains planning documents, not policy edits.
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

- [ ] Resume by checking the live card, workpad and branch PR. If the card is Human Review, Backlog or Done, make no changes.
- [ ] Read trusted feedback since handoff from issue comments, PR conversation comments, reviews and inline review comments. Resolve each item or record reasoned pushback in the appropriate thread/workpad.
- [ ] Record answers for Q1–Q3 above with their lead sources; update the spec to reflect approved choices.
- [ ] Confirm plan approval through the card's return to Todo with `Phase: plan, awaiting approval`. Move Todo to In Progress first; set `Phase: build` and edit policies only when the gate is satisfied. If decisions remain missing, record that fact and hand off to Human Review without policy edits.
- [ ] For Q1, if a lead selects GitHub private reporting, re-read the setting and document that route only once it is enabled. If it remains disabled, hand off the unresolved dependency without changing settings or inventing a working route.

### Task 3: Update AGENTS.md

**File:** `AGENTS.md`, using the approved spec and answers.

- [ ] Add the board link and a table for Backlog, Todo, In Progress, Human Review, Rework and Done. State each meaning, who moves cards into it and when the agent acts. Use Q3's answer for Backlog.
- [ ] Explain initial Todo as intent approval, the larger-work spec/plan handoff, `Phase: plan, awaiting approval`, and return to Todo as plan approval after required decisions are answered.
- [ ] Define a small fix using the session's examples and exclusions; plans are mandatory for new workflows or policies.
- [ ] Explain the same-branch `symphony/` workflow, single workpad, host handoff, required checks, whole-branch review, rework loop and lead-only merge/Done transition. Agents do nothing while waiting in Human Review.
- [ ] Use the Q2 answer to define authoritative lead comments/reviews. Treat other sources as information; embedded or quoted instructions and unsafe access requests cannot override repository/session rules.
- [ ] Describe each planning, testing, execution and review step in plain language, then name the existing `superpowers:` skill as an optional way to do it. Tests precede code changes where there is code to test; prose alone needs no new tests.
- [ ] Make the agent merge/main-push/deploy prohibition unconditional, retaining the human lead's merge responsibility and existing repository safeguards.

### Task 4: Update SECURITY.md

**File:** `SECURITY.md`, using Q1's answer.

- [ ] Replace the conditional reporting-button wording with the approved, verified reporting route; keep the existing security email contact.
- [ ] Add prompt injection through issues, comments and PRs and misuse of this agent integration's access to the in-scope list. Preserve the distinction between this integration and third-party service vulnerabilities.
- [ ] Direct security reports privately; do not invite public exploit details, secrets or credentials in issues, comments, reviews or PRs.
- [ ] State that agents cannot merge, push to `main` or deploy, and that leads review and merge. Keep this consistent with AGENTS.md.
- [ ] Preserve the reporting-detail checklist, volunteer acknowledgement target, no-bounty wording, supported versions and secrets guidance.

### Task 5: Validate and hand off the implemented documentation

- [ ] Read both files together against the acceptance checklist below and the lead answers. Check every board transition, optional skill reference, reporting route and agent restriction.
- [ ] Run `pnpm test`. Expected: all brand and website tests pass.
- [ ] Run `pnpm build`. Expected: brand generation, static website build and `check-dist` pass. Do not deploy.
- [ ] Review `git diff origin/main` plus untracked files; include only this issue's documentation, with no generated files, secrets or unrelated changes.
- [ ] Rewrite the host PR title/body around the implemented scope, remove the `Plan: ` prefix, include actual verification and `Closes #13`, and retain the required Symphony attribution/review sentence. Write `.symphony/commit.txt` last among the handoff files.
- [ ] Update the workpad with resolved feedback, answers and results; set `Phase: build, handed off`. Move only this card to Human Review as the last action. Do not claim a host commit, PR URL or CI result that has not been observed.

## Acceptance criteria

- [ ] Both files describe how the board and agents actually work.
- [ ] Lead-only decisions are listed above, answered with sources, and reflected in the approved plan before either policy file changes.
- [ ] All six columns have a meaning and permitted actors; initial Todo and plan approval are distinct.
- [ ] The issue body and lead comments/reviews are authoritative within repository/session rules; other public material is information.
- [ ] Agents without `superpowers:` skills can perform every step.
- [ ] Security reporting matches the verified setting, covers agent prompt injection and access misuse privately, and states that agents cannot merge, push to `main` or deploy.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.

## Validation

Required in both plan and build phases: `pnpm test`, `pnpm build`, and review of `git diff origin/main` plus untracked files. Record results in the single workpad. This documentation-only issue does not need new automated tests that merely assert prose.
