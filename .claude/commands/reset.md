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
2. Move all files from `pipeline/` (except `archive/`)
   into `pipeline/archive/run-{timestamp}/` (this includes `context.md`)
3. Reset `pipeline/context.md` to its empty template (the header and
   empty sections — no carried-over content). The old context is preserved
   in the archive from step 2.
4. Recreate empty directories: `pipeline/gates/`, `pipeline/adr/`,
   `pipeline/code-review/`
5. Clean up orphaned git worktrees from Stage 4:
   Run `git worktree list`. For any worktree whose path contains
   `dev-team-`, run `git worktree remove <path> --force`.
   Report what was cleaned up (or "no orphaned worktrees found").
6. Report what was archived and confirm the pipeline is ready

Archive label (if provided): $ARGUMENTS

Do NOT run git commands. Do NOT delete anything permanently.
Do NOT touch src/ or .claude/.
