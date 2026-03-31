---
description: >
  Reset the pipeline for a new feature run. Archives the current pipeline
  output, clears gate files, and prepares for a fresh start. Does NOT
  touch src/ — code changes are managed via git.
  Usage: /reset [optional archive label]
---

# Pipeline Reset

Archive and reset the pipeline directory for a new feature run.

Steps:
1. Create `pipeline/archive/` if it doesn't exist
2. Move all files from `pipeline/` (except `archive/` and `context.md`)
   into `pipeline/archive/run-{timestamp}/`
3. Preserve `pipeline/context.md` — append a separator:
   `---\n## New Run: {timestamp}\n---`
4. Recreate empty directories: `pipeline/gates/`, `pipeline/adr/`,
   `pipeline/code-review/`
5. Report what was archived and confirm the pipeline is ready

Archive label (if provided): $ARGUMENTS

Do NOT run git commands. Do NOT delete anything permanently.
Do NOT touch src/ or .claude/.
