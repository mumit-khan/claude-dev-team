---
description: >
  Produce a concise context dump of the current pipeline state. Use this
  before a /compact operation or when resuming a paused pipeline run.
  Prints the status of every gate file and any open questions.
---

# /pipeline-context

Read all files in `pipeline/gates/` and `pipeline/context.md`.

Print a status table:

| Stage | Gate File | Status | Agent | Key Info |
|-------|-----------|--------|-------|----------|
| ...   | ...       | ...    | ...   | ...      |

Then print any open questions from `pipeline/context.md`
(lines starting with `QUESTION:` that have no `PM-ANSWER:` below them).

Then print the next stage that needs to run based on the first gate
with status `FAIL`, `ESCALATE`, or missing.

Keep the output concise. No prose padding.
