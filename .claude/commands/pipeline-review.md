---
description: >
  Run only Stage 5 (peer code review) on the current state of src/.
  Useful after making manual edits outside the pipeline, or re-reviewing
  after a round of fixes. Does not re-run build or tests.
---

# /pipeline-review

Read `.claude/rules/pipeline.md` Stage 5 instructions only.

Invoke `dev-backend`, `dev-frontend`, and `dev-platform` agents as reviewers
following the review matrix defined in Stage 5.

Each reviewer must read:
- `pipeline/brief.md`
- `pipeline/design-spec.md`
- `pipeline/adr/` (all files)
- The other reviewers' output if already written
- Changed files in `src/`

Write reviews to `pipeline/code-review/`.
Write stage-05 gate files to `pipeline/gates/`.
Escalate to `principal` agent if any reviewer flags an architectural issue.
