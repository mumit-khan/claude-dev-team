---
description: >
  Run a single named pipeline stage explicitly. Use when you want to re-run
  one stage without triggering the full pipeline — for example after a manual
  fix, after a failed gate, or to resume a halted pipeline from a specific point.
  Arguments: stage name (e.g. "design", "build", "review", "test", "deploy").
---

# /stage

Run a single pipeline stage. The stage name is: $ARGUMENTS

Valid stage names:
- `requirements` — Stage 1: PM writes brief
- `design` — Stage 2: Principal drafts + devs annotate + Principal chairs
- `clarify` — Stage 3: PM answers open questions before build
- `build` — Stage 4: All three devs build in parallel
- `review` — Stage 5: Peer code review
- `test` — Stage 6: Platform dev runs full test suite
- `signoff` — Stage 7: PM sign-off
- `deploy` — Stage 8: Platform dev deploys

## Before Running

1. Read `.claude/rules/pipeline.md` for the stage definition
2. Check `pipeline/gates/` for the prior stage gate — confirm it passed
3. Check `pipeline/context.md` for any open questions relevant to this stage

## After Running

The stage writes its gate file to `pipeline/gates/`. The gate-validator hook
runs automatically. If the gate passes, report success. If it fails or
escalates, surface the reason to the user.
