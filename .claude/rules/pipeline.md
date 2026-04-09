# Pipeline Rules

## Stage 1 — Requirements (PM)

Invoke: `pm` agent
Input: user's feature request
Output: `pipeline/brief.md`
Gate file: `pipeline/gates/stage-01.json`
Gate key: `"status": "PASS"`

The PM defines acceptance criteria and scope. Engineers do not begin design
until the gate passes. After gate passes → HUMAN CHECKPOINT A.

---

## Stage 2 — Design (Principal + Dev input)

Step 2a — Principal drafts:
  Invoke: `principal` agent
  Input: `pipeline/brief.md`
  Output: `pipeline/design-spec.md` (status: DRAFT)

Step 2b — Dev annotation (parallel, read-only):
  Invoke in parallel: `dev-backend`, `dev-frontend`, `dev-platform`
  Each appends concerns to: `pipeline/design-review-notes.md`
  These are read-only passes — no code written yet.

Step 2c — Principal chairs review:
  Invoke: `principal` agent
  Input: `pipeline/design-spec.md` + `pipeline/design-review-notes.md`
  Output: updated `pipeline/design-spec.md`, ADR files in `pipeline/adr/`
  Gate file: `pipeline/gates/stage-02.json`
  Gate keys: `"arch_approved": true` AND `"pm_approved": true`
  For PM approval: invoke `pm` agent to confirm scope fit after Principal approves.

After both approvals → HUMAN CHECKPOINT B.

---

## Stage 3 — Pre-Build Clarification

Check `pipeline/context.md` for any lines starting with `QUESTION:` that lack a `PM-ANSWER:`.
If any exist: invoke `pm` agent with those questions before proceeding.
If none: proceed immediately.

---

## Stage 4 — Build (3 Devs, parallel via git worktrees)

Each dev works in its own worktree:
  `git worktree add ../dev-team-backend feature/backend`
  `git worktree add ../dev-team-frontend feature/frontend`
  `git worktree add ../dev-team-platform feature/platform`

Invoke in parallel:
  `dev-backend`  → `src/backend/`  → `pipeline/pr-backend.md`
  `dev-frontend` → `src/frontend/` → `pipeline/pr-frontend.md`
  `dev-platform` → `src/infra/`    → `pipeline/pr-platform.md`

Gate file per PR: `pipeline/gates/stage-04-{area}.json`
All three must have `"status": "PASS"` before proceeding.

---

## Stage 5 — Peer Code Review (Agent Teams preferred, sequential fallback)

Each dev reviews the OTHER TWO devs' PRs.
Review matrix:
  `dev-backend`  reviews: frontend + platform → writes `pipeline/code-review/by-backend.md`
  `dev-frontend` reviews: backend + platform  → writes `pipeline/code-review/by-frontend.md`
  `dev-platform` reviews: backend + frontend  → writes `pipeline/code-review/by-platform.md`

### Gate Merge Strategy for Stage 5

Each area gate (`pipeline/gates/stage-05-{area}.json`) must accumulate 2 approvals.
When a reviewer writes their approval:
- If the gate file does not yet exist: write a new gate with `"approvals": ["your-agent-name"]`
- If the gate file exists: read it first, then update `"approvals"` to append your name

Never overwrite a gate that already has entries in `"approvals"`. Append only.
The gate reaches `"status": "PASS"` only when `"approvals"` contains 2 entries.
If a reviewer writes `REVIEW: CHANGES REQUESTED`, do not add their name to `"approvals"`;
instead add to `"changes_requested"` and leave `"status": "FAIL"`.

Pre-read requirement (pass to each reviewer agent):
  - `pipeline/brief.md`
  - `pipeline/design-spec.md`
  - `pipeline/adr/` (all files)
  - The other reviewer's file if already written (sequential fallback)

Gate per PR area: needs 2 REVIEW:APPROVED entries in gate file
  `pipeline/gates/stage-05-{area}.json`

On architectural escalation: invoke `principal` agent. Principal ruling is binding.
On deadlock (reviewers disagree, no escalation): invoke `principal` agent to decide.

---

## Stage 6 — Test & CI (Platform Dev)

Invoke: `dev-platform` agent
Input: `src/` + `pipeline/brief.md` (acceptance criteria)
Output: `pipeline/test-report.md`
Gate file: `pipeline/gates/stage-06.json`
Gate key: `"status": "PASS"` with `"all_acceptance_criteria_met": true`

On failure: identify owning dev from failing test, invoke that dev with failure context.
Retry limit: 3 cycles. On 3rd failure of same test: auto-escalate to `principal`.

After gate passes → HUMAN CHECKPOINT C.

---

## Stage 7 — PM Sign-off

Invoke: `pm` agent
Input: `pipeline/test-report.md` + `pipeline/brief.md`
Output: sign-off appended to `pipeline/gates/stage-07.json`
Gate key: `"pm_signoff": true`

On NO: PM writes delta list. Return to Stage 4 with delta items only.
Delta items must not trigger a full pipeline rerun — scope them explicitly.

---

## Stage 8 — Deploy (Platform Dev)

Invoke: `dev-platform` agent
Precondition: confirm `pipeline/gates/stage-07.json` has `"pm_signoff": true`
Output: `pipeline/deploy-log.md`
Gate file: `pipeline/gates/stage-08.json`
Gate key: `"status": "PASS"`

Post-deploy: invoke `pm` agent to write stakeholder summary.

---

## Stage Duration Expectations

Typical durations for each stage. These are guidelines, not hard limits —
Claude Code does not enforce timeouts on agent execution. If a stage
seems stalled, use `/status` to check progress and `/pipeline-context`
for a full state dump.

| Stage | Typical Duration | Notes |
|-------|-----------------|-------|
| 1 — Requirements | 2-5 min | Single agent (PM). Fast unless scope is ambiguous. |
| 2 — Design | 5-15 min | Sequential: draft → annotation → review. Longest non-build stage. |
| 3 — Clarification | <1 min | Pass-through if no open questions. |
| 4 — Build | 5-20 min | Parallel (3 devs). Wall-clock = slowest dev. Complexity-dependent. |
| 5 — Code Review | 5-15 min | 3 reviewers, each reading 2 PRs. Sequential fallback is slower. |
| 6 — Test & CI | 3-10 min | Depends on test suite size and whether retries are needed. |
| 7 — PM Sign-off | 1-3 min | Single agent review. |
| 8 — Deploy | 3-10 min | Docker build + smoke tests. Network-dependent. |

**Full pipeline**: 25-80 minutes typical, depending on feature complexity.

**Stall indicators**:
- Stage 4 taking >30 min: check if a dev agent hit an ambiguity and wrote
  a `QUESTION:` to `pipeline/context.md` without the orchestrator noticing.
- Stage 6 retry loops: check if the same test is failing repeatedly
  (auto-escalates after 3 identical failures).
- Any stage with no gate file written after 15 min: likely a context or
  permission issue. Check the agent's output for errors.

**Claude Code session limits**: Claude Code conversations have a context
window limit. Long pipeline runs may trigger automatic compaction. The
`/pipeline-context` command captures state before compaction, and
`.claude/rules/compaction.md` tells Claude what to preserve.
