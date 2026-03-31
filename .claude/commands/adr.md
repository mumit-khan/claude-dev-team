---
description: >
  Create a new Architecture Decision Record. Use when the Principal or a
  developer needs to document a significant technical decision, a rejected
  alternative, or a known trade-off. Argument: short title for the ADR.
---

# /adr

Create a new Architecture Decision Record.
Title: $ARGUMENTS

Steps:
1. Count existing files in `pipeline/adr/` to determine the next sequence number
2. Create `pipeline/adr/NNNN-{kebab-case-title}.md` using the ADR format

## ADR Format

```markdown
# NNNN — Title

**Status**: Accepted | Rejected | Deferred | Superseded by NNNN
**Date**: YYYY-MM-DD
**Author**: [agent name]

## Context
What situation or problem prompted this decision?

## Decision
What was decided, in one or two sentences.

## Rationale
Why this option over alternatives? List alternatives considered and why
each was rejected.

## Consequences
What trade-offs does this decision accept? What becomes harder?

## References
Links to relevant specs, PRs, or prior ADRs.
```

After creating the file, print the ADR path and a one-line summary.
