---
description: >
  Invoke the Principal Engineer to make a binding technical ruling on a
  specific question or conflict. Use when reviewers disagree, when an
  architectural concern has been escalated, or when a technical decision
  needs documented authority.
  Usage: /principal-ruling <question or conflict description>
---

# Principal Ruling

Invoke the `principal` agent in ruling mode.

Context: $ARGUMENTS

The Principal should:
1. Read `pipeline/design-spec.md` and relevant `pipeline/adr/` files
2. Read the relevant `pipeline/code-review/` files if a review conflict exists
3. Make a binding decision
4. Write an ADR to `pipeline/adr/` documenting the ruling
5. Append the decision to `pipeline/context.md` under `## Key Decisions`

After the ruling, print a summary and ask if the user wants to resume
the pipeline at the stage where the escalation occurred.
