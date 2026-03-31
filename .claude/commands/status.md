---
description: >
  Show the current status of all pipeline stages for the active feature.
  Reads all gate files and prints a dashboard. Use at any point to see
  which stages have passed, failed, or are pending.
---

# /status

Read all JSON files in `pipeline/gates/` and print a status dashboard.

## Output Format

Print a table like this:

```
Pipeline Status
═══════════════════════════════════════════════════════════════
Stage                    Status      Agent           Notes
───────────────────────────────────────────────────────────────
01 Requirements          ✅ PASS     pm
02 Design                ✅ PASS     principal       2 ADRs written
04a Build (backend)      ✅ PASS     dev-backend
04b Build (frontend)     ✅ PASS     dev-frontend
04c Build (platform)     ⏳ PENDING  —
05  Review               ⏳ PENDING  —
06  Tests                ⏳ PENDING  —
07  PM Sign-off          ⏳ PENDING  —
08  Deploy               ⏳ PENDING  —
───────────────────────────────────────────────────────────────
```

Also print:
- Any open questions from `pipeline/context.md` that lack a PM-ANSWER
- Any warnings accumulated across gates
- Next recommended action based on the first non-PASS stage
