---
description: >
  Run the full dev team pipeline for a feature request. Use this command
  when the user wants to build a new feature end-to-end: requirements,
  design, build, review, test, and deploy. Orchestrates PM → Principal →
  Devs → Code Review → Test → Deploy with human checkpoints.
---

# /pipeline

You are running the full dev team pipeline.
Read `.claude/rules/pipeline.md` before doing anything else.

## Input

The text after `/pipeline` is the feature request.
If none is provided, ask: "What feature would you like to build?"

## Startup Checklist

Before invoking any agent:
1. Read `CLAUDE.md`
2. Read `.claude/rules/pipeline.md`
3. Read `.claude/rules/gates.md`
4. Read `.claude/rules/escalation.md`
5. Read `pipeline/context.md`
6. Ensure `pipeline/gates/` exists — create if missing

## Execution

Follow the stage sequence in `.claude/rules/pipeline.md` exactly.

After each stage, print one status line:
`[Stage N — Name] ✅ PASS` or `[Stage N — Name] ❌ FAIL — reason`

At each HUMAN CHECKPOINT (A, B, C):
- Print a plain-English summary of what was produced
- Write the checkpoint gate file
- Print: "✋ **Checkpoint [A/B/C]** — type `proceed` to continue, or give feedback to adjust before the next stage"
- Halt and wait

On ESCALATE from any gate:
- Stop immediately
- Print the `escalation_reason` and `decision_needed`
- Show `options` if present
- Wait for user input
- Record the decision in `pipeline/context.md` under `## User Decisions`
- Resume from the halted stage

## End of Pipeline

Print a summary table:

| Stage | Name | Status |
|-------|------|--------|
| 1 | Requirements | ✅ |
| 2 | Design | ✅ |
| ... | ... | ... |
