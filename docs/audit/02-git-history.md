# 02 — Git History

_Generated: 2026-04-16_

## Summary

- **Total commits (all time):** 39.
- **First commit:** 2026-03-31 (`Initial commit`).
- **Most recent:** 2026-04-16 (merge of roadmap/audit PR #8).
- **Authors:** `Mumit Khan` (maintainer) and `Claude` (AI contributor on
  recent health-check automation).
- **Repo age:** ~16 days of active history. History is not shallow; all
  39 commits are reachable.
- **PR discipline:** 8+ merged PRs via GitHub merge commits. Feature
  branches follow `feat/`, `fix/`, `refactor/`, `improve/`, or
  `claude/...` prefixes.
- **Churn volume (last 6 months):** 28 non-merge commits touching 113
  file-changes, +9,501 / −866 lines.

## Churn hotspots (last 6 months)

| Commits | File |
|---|---|
| 5 | `README.md` |
| 3 | `pipeline/context.md` (a tracked scaffold template) |
| 3 | `package.json` |
| 3 | `docs/build-presentation.js` |
| 3 | `bootstrap.sh` |
| 3 | `CLAUDE.md` |
| 3 | `AGENTS.md` |
| 3 | `.claude/rules/pipeline.md` |
| 3 | `.claude/commands/reset.md` |
| 3 | `.claude/agents/dev-platform.md` |

No single file dominates. The repo is broadly evolving, consistent with
a young framework. Top-3 hotspots (`README.md`, `pipeline.md`,
`dev-platform.md`) are the user-facing contract and the most
behaviour-rich documents — natural attractors.

## Co-change patterns

The git log shows tight co-change clusters:

### Cluster A — "presentation bundle"

`docs/build-presentation.js` ↔ `package.json` ↔ `package-lock.json` ↔
`tests/smoke-presentation.test.js` ↔ `eslint.config.js` ↔
`.github/workflows/test.yml` ↔ `docs/audit/09-backlog.md`.

**Signal:** adding npm tooling and an ESLint config together. These five
files will probably keep moving together when lint/test scope changes.
Flags the presentation script as a pure leaf now glued to the test
harness.

### Cluster B — "audit output refresh"

`.gitignore` ↔ `docs/audit/00-project-context.md` through `10-roadmap.md`
↔ `status.json`.

**Signal:** commit `4234e60 "docs: track audit files in version
control"` moved `docs/audit/` from gitignored to tracked. All 11 audit
files moved in a single commit — this is our baseline going forward.

### Cluster C — "implement skill ↔ lifecycle docs"

`.claude/skills/implement/SKILL.md` ↔ `docs/lifecycle.md`. Whenever the
`implement` skill semantics change, the lifecycle doc follows.

### Cluster D — "framework front door"

`.claude/rules/orchestrator.md`, `CLAUDE.md`, `CONTRIBUTING.md`,
`README.md`, `bootstrap.sh`, `docs/faq.md`, `tests/bootstrap.test.js`
moved together in the "bootstrap safe for existing projects" refactor.
Strong indicator that the installer UX is one conceptual unit.

## Recent trajectory

**Active (April 2026):**
- `docs/audit/*` — the audit discipline itself is churning.
- `.claude/commands/reset.md`, `.claude/commands/hotfix.md` — workflow
  sharpening for edge cases.
- `tests/*.test.js` — test suite is growing fast (zero tests before
  `db0b66d` on 2026-04-09).

**Stable (no changes in last 2 weeks):**
- `.claude/rules/gates.md`, `.claude/rules/escalation.md`,
  `.claude/rules/compaction.md` — the gate/escalation vocabulary has
  settled.
- `.claude/skills/code-conventions/SKILL.md`,
  `.claude/skills/api-conventions/SKILL.md` — convention docs untouched
  since initial commit.
- `.claude/hooks/gate-validator.js` — last meaningful change 2026-04-02
  (added required-field validation).

## Commit quality

**Messages:** conventional-commits style (`feat:`, `fix:`, `refactor:`,
`docs:`, `test:`, `chore:`) with occasional scopes (e.g.,
`feat(implement): …`). Consistent and machine-parseable.

**Size distribution:** 28 non-merge commits × 113 file-changes ≈ 4 files
per commit. Healthy. No "megacommits". Two notably large commits:
- `bc962c8 "feat: add audit workflow, implement/review skills, and
  lifecycle docs"` — big feature landing; could have been split into
  (a) audit command set, (b) skills, (c) lifecycle doc.
- `388a1c0 "feat: implement all health-check recommended actions"` —
  the batched follow-up to the April health check; also mixed.

**Focus:** commit titles consistently capture intent. No "wip", "fix
typo", or "more stuff" titles.

**Review discipline:** every merged PR goes through GitHub's merge-commit
flow. No force-pushes to `main` visible. `.claude/settings.json` denies
`git push origin main` and `git push --force`, so the guardrail matches
the observed pattern.

**Branch hygiene:** `improve/<topic>` and `claude/<short-slug>-<hash>`
naming. Claude-authored branches follow the conventions the framework
preaches — healthy dogfood signal.

## Risks implied by the history

1. **`README.md` is the most churned file (5 commits).** It is also
   acting as the canonical UX doc for all commands. Risk: drift between
   README and the actual command list in `.claude/commands/` if the
   README is not treated as a test artifact. The audit's Phase 1.3
   should check this.
2. **The `implement` skill and `lifecycle.md` co-change but there is no
   test pinning them together.** A silent divergence is possible.
3. **Many commands/agents have low churn (1–2 commits).** That usually
   means they are stable — but for recently introduced surface area
   (e.g., `audit-quick`, `principal-ruling`, `design`), low churn may
   mean "untested in the wild". Expect behavioral bugs to surface as
   users exercise them.
4. **`package.json` + `package-lock.json` co-change is missing from one
   commit** (they moved together consistently, but we do not verify
   `package-lock.json` is in sync in CI — `npm install` is used instead
   of `npm ci`). Carry this into the health / security phases.
