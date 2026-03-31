---
description: >
  Ask the PM a clarification question mid-pipeline without running a full stage.
  Use when a developer hit an ambiguous requirement and needs a PM answer
  before work can continue. Invokes the pm agent in clarification mode.
---

# /ask-pm

Invoke the `pm` agent in clarification mode.

The `pm` agent will:
1. Read all open `QUESTION:` lines in `pipeline/context.md`
2. Answer each one with a `PM-ANSWER:` line directly below it
3. Update `pipeline/brief.md` if any answer changes scope

After the PM agent finishes, print a summary of answers and whether
any brief changes were made.

No gate file is written — this is a clarification pass only.
