---
description: >
  Run only Stage 1 (PM requirements brief) without starting the full pipeline.
  Useful for drafting and refining a brief before committing to a full run.
  Pass the feature description as the argument.
---

# /pipeline-brief

Read `.claude/rules/pipeline.md` Stage 1 instructions only.

The feature request is: $ARGUMENTS

Invoke the `pm` agent to produce `pipeline/brief.md`.
After the gate passes, print the brief summary and stop.
Do not proceed to design automatically.
