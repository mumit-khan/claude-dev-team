---
description: >
  Run an expedited hotfix pipeline: skips design stage, goes directly to
  build → peer review → test → deploy. Use ONLY for critical production
  bugs with a clear, scoped fix. Requires PM sign-off before deploy.
  Pass a description of the bug and the intended fix as the argument.
---

# /hotfix

⚠️  HOTFIX MODE — Design stage skipped. Use only for scoped production bugs.

The bug and fix description is: $ARGUMENTS

Read `.claude/rules/pipeline.md` for stage details, but run only:
  Stage 4 (Build) → Stage 5 (Review) → Stage 6 (Test) → Stage 7 (PM sign-off) → Stage 8 (Deploy)

Before invoking any dev agent, write a minimal fix spec to
`pipeline/hotfix-spec.md` covering:
- What is broken
- What the fix changes
- What must NOT change (blast radius constraint)

Pass `pipeline/hotfix-spec.md` to each dev agent instead of `pipeline/design-spec.md`.

Human checkpoints still apply at Checkpoint C (after tests pass).
PM sign-off is required before deploy regardless of urgency.
