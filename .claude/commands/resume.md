---
description: >
  Resume the pipeline from a specific stage. Use after a human checkpoint
  approval, after resolving an escalation, or after manually fixing something
  between stages. Usage: /resume <stage-number> [reason]
  Example: /resume 4 "design approved at checkpoint B"
---

# Pipeline Resume

Read these files before starting:
1. `CLAUDE.md`
2. `.claude/rules/pipeline.md`
3. `.claude/rules/gates.md`
4. `.claude/rules/escalation.md`
5. `pipeline/context.md`
6. All existing `pipeline/gates/*.json` files — understand current pipeline state

Resume from Stage $ARGUMENTS.

Before proceeding: verify all gates for stages prior to the resume point
show `"status": "PASS"`. If any prior gate is missing or FAIL, report to
the user before continuing.
