---
description: >
  Run peer code review for one or all PR areas. Each dev reviews the other
  two devs' PRs. Use after build stage completes, or to re-run review after
  a developer addresses review feedback. Argument: "all", "backend",
  "frontend", or "platform".
---

# /review

Run peer code review. Target: $ARGUMENTS (default: "all")

## Review Matrix

Each dev reviews the other two:
- `dev-backend`  → reviews frontend + platform PRs
- `dev-frontend` → reviews backend + platform PRs
- `dev-platform` → reviews backend + frontend PRs

## Execution

For target "all": invoke all three reviewers. Sequential fallback if Agent
Teams is unavailable — each reviewer reads prior reviews before writing.

For a specific target (e.g. "backend"): invoke only the two reviewers
assigned to that PR area.

## Pre-Read Requirement

Pass to each reviewer agent:
- `pipeline/brief.md`
- `pipeline/design-spec.md`
- `pipeline/adr/` contents
- Any existing review files already written this cycle
- The changed files for the PRs they are reviewing

## Gate

Each PR area needs 2 `REVIEW: APPROVED` entries in its gate file.
Any `REVIEW: CHANGES REQUESTED` with BLOCKERs halts that area.
Any `ESCALATE:` triggers the escalation flow — invoke `principal` agent.
