# 05 — Documentation Gaps

_Generated: 2026-04-16_

## Summary

- **Doc surface:** 7 top-level prose files (1,358 LOC) + 5 agent files +
  18 command files + 6 skill files + 4 rules files + 2 reference files.
  Substantial for a 56-file repo.
- **Quality:** above average. README is the strongest artifact; FAQ and
  lifecycle.md form a complete evaluator funnel. CONTRIBUTING.md exists
  (new since the 2026-04-09 snapshot) and covers setup, tests, and
  structure.
- **Main gaps:** one confirmed stale claim in `docs/faq.md:27`, one
  outdated project-structure listing in `README.md`, one empty
  project-instructions file (`CLAUDE.md`), and no cross-doc integrity
  test. No CODEOWNERS, issue templates, or PR templates.

## README quality

`README.md` (297 LOC) covers: prerequisites, setup, a "When to Use What"
decision table, pipeline overview with checkpoints, audit workflow,
project structure, agent models, gate system, customisation, limitations,
and links to supporting docs. Strong.

### README issues

#### R1. Project-structure listing omits `orchestrator.md` — LOW

`README.md:179-184` lists the contents of `.claude/rules/`:

```
│   ├── rules/
│   │   ├── pipeline.md
│   │   ├── gates.md
│   │   ├── escalation.md
│   │   └── compaction.md
```

But `.claude/rules/` also contains `orchestrator.md` (the top-level
coordinator rules loaded by `CLAUDE.md`). Missing it from the tree
diagram is a pure documentation slip — the file exists and is loaded.

**Fix:** add `orchestrator.md` to the listing.

#### R2. README command list omits entries — LOW

The "When to Use What" table and `/pipeline` sections cover ~13
commands. `.claude/commands/` actually contains 18 command files
(including `design`, `ask-pm`, `pipeline-context`, `reset`, `resume`,
`stage`, `status`). `AGENTS.md` lists all 18; the README lists a curated
subset. Deliberate trade-off, but not signposted — a reader might not
realise `/design`, `/ask-pm`, or `/reset` exist.

**Fix:** add a "Full command list: see `AGENTS.md`" pointer near the
decision table.

#### R3. Repo URL convention — LOW (intentional)

`README.md`, `docs/lifecycle.md:5`, and `docs/faq.md:147` all reference
`github.com/mumit/claude-dev-team`, while the actual remote (per PR
scope in this session) is `mumit-khan/claude-dev-team`. Assessment:
**intentional** — `mumit` is the canonical vanity handle. No action
needed, but worth a one-line note in CONTRIBUTING.md so a new
contributor isn't confused when `git remote -v` differs.

## Stale documentation

### S1. `docs/faq.md:27` — `docs/audit/` is no longer gitignored — MEDIUM

> "Generated audit output goes to `docs/audit/`, feature build artifacts
> go to `pipeline/`. Both are gitignored by default since they're
> generated."

**Status:** confirmed stale. Commit `4234e60 "docs: track audit files in
version control"` removed `docs/audit/` from `.gitignore` and tracked
all 11 audit files in version control. `pipeline/` remains gitignored
(correct); `docs/audit/` does not (incorrect).

**Impact:** a reader following the FAQ's guidance would expect
`docs/audit/*.md` to be untracked and might be surprised to see them in
`git status` after an audit run.

**Fix:** rewrite to "`pipeline/` is gitignored by default. `docs/audit/`
is tracked — audit output is a shared artifact."

### S2. `.claude/settings.json` command allowlist — ongoing drift — LOW

The allowlist in `settings.json` enumerates specific Bash commands
(e.g., `Bash(npm test)`, `Bash(git push:*)`). When new agents introduce
new commands, the allowlist can drift silently — the only signal is a
runtime permission prompt. Not a doc bug, but a doc-adjacent risk:
there is no documented process for updating the allowlist when adding
an agent.

**Fix:** add a one-line note to CONTRIBUTING.md under "Making Changes":
"If a new agent invokes a new Bash command, update
`.claude/settings.json` permissions.allow."

### S3. `README.md` "Agent Teams is experimental" — LOW

> "Agent Teams is experimental (requires v2.1.32+). On failure, review
> falls back to sequential..."

Claude Code v2.1.32 is the minimum per `README.md:12`. Whether Agent
Teams has graduated from experimental depends on the current Claude
Code release channel. A time-bomb note: accurate today, likely stale
within 6 months. **Fix:** track with a calendar reminder rather than
fix now.

## Component documentation coverage

| Component | Doc location | Status |
|---|---|---|
| 5 agents | `.claude/agents/*.md` + `AGENTS.md` summary | ✅ complete, with YAML frontmatter and role/responsibilities |
| 18 commands | `.claude/commands/*.md` | ✅ complete, each has a `description:` frontmatter used by the slash-command picker |
| 6 skills | `.claude/skills/*/SKILL.md` | ✅ complete, each has description and trigger phrases |
| 4 rules files | `.claude/rules/*.md` | ✅ complete, machine-readable process definitions |
| 2 references | `.claude/references/*.md` | ✅ complete (audit-phases, audit-extensions-example) |
| `gate-validator.js` (89 LOC) | Top comment + inline | ⚠️ minimal — top-level intent documented, branch logic not |
| `bootstrap.sh` (167 LOC) | Inline echo + section headers | ✅ good — each step prints what it's doing |
| `docs/build-presentation.js` (684 LOC) | Top comment only | ❌ under-documented — 400+ line `main()` with no section markers |

## Cross-document integrity

### C1. Agent list appears in 4 places with no sync test — MEDIUM

Agents are enumerated in:
1. `.claude/agents/*.md` (source of truth — 5 files)
2. `.claude/rules/orchestrator.md` "The Team" section
3. `AGENTS.md` (full human-readable summary)
4. `README.md` "Agent Models" table

A typo, rename, or added agent in source needs four synchronised edits.
No test verifies they match. Listed as finding E2 in `03-compliance.md`.

**Fix:** add a `cross-doc-sync.test.js` that parses each list and
asserts equality. ~30 minutes of work.

### C2. Command list appears in 3 places with no sync test — MEDIUM

Commands enumerated in:
1. `.claude/commands/*.md` (source — 18 files)
2. `README.md` "When to Use What" (curated subset)
3. `AGENTS.md` "Commands and Skills" tables (full list)

Same drift risk as C1. **Fix:** same test covers both.

### C3. CONTRIBUTING.md instructions vs `package.json` scripts — LOW

`CONTRIBUTING.md:21-23` documents:
```
npm test                    # unit tests
npm run test:integration    # integration tests
```

But `package.json` scripts:
- `test` — runs all tests (unit + integration mixed)
- No `test:integration` script exists.

Running `npm run test:integration` fails with "Missing script:
test:integration". Either add the script or remove the doc line.

**Fix (preferred):** add `"test:integration": "node --test
'tests/bootstrap.test.js'"` to `package.json` so the doc line works.

## Inline documentation

### I1. `gate-validator.js:89 LOC` — LOW

- Top-of-file header explains purpose and exit codes ✅
- Required-field loop has no comment ⚠️
- mtime-sort to "pick latest gate" is not explained (subtle invariant) ⚠️

One-line comments on the two subtle spots would help future maintainers.

### I2. `docs/build-presentation.js:684 LOC` — MEDIUM

- Zero function-level docstrings
- Design palette constants (hex values) carry no explanation of intent
- 400+ line `main()` body of sequential slide construction with no
  section markers. A reader cannot skim the file to find "slide 7".

**Fix:** add section-header comments every 2-3 slides and a one-line
docstring per helper. Low-risk refactor, high-readability payoff.

### I3. `bootstrap.sh` — LOW

Well-commented overall. One non-obvious flag worth a comment: `cp -rn`
(copy recursively, no-clobber) on the framework files — the `n` flag is
what preserves user customisation, not immediately obvious from reading.

## Onboarding test — what would a new contributor struggle with?

1. **Empty CLAUDE.md.** `CLAUDE.md` is 5 lines — a header and three
   HTML comments. A new contributor opens it expecting project-specific
   instructions and finds a placeholder saying "Add project-specific
   instructions below." The file is effectively empty of content but
   loaded by the orchestrator. **Suggestion:** either remove the file
   (and update `orchestrator.md:34` which says "Project instructions →
   CLAUDE.md") or populate it with the framework's own dogfood
   instructions (e.g., "This repo tests the framework itself; for
   modifying agents/commands/skills, see CONTRIBUTING.md").

2. **"Where are the tests documented?"** `CONTRIBUTING.md` points to
   `npm test` and `npm run test:integration` — the latter is missing
   (see C3). No `tests/README.md` exists to orient a newcomer to the
   structure of the 4 test files.

3. **"Where's the extension example?"** `README.md:137` says
   `docs/audit-extensions.md` is the place for project-specific audit
   checks. A newcomer to the repo might look for that file and find it
   absent — because it's the *user's* file, not the framework's. Worth
   a one-line clarification.

4. **`EXAMPLE.md` (444 LOC) is not linked from README.** It sits at the
   repo root, walks through a full pipeline run end-to-end, and is
   exactly the doc a new user would want. But it's invisible to
   someone browsing via README. **Fix:** add "For a full worked
   pipeline example, see `EXAMPLE.md`." to README's Pipeline section.

5. **"What's `audit-extensions.md`?"** Referenced in README:137 and
   `.claude/references/audit-extensions-example.md` exists as a
   template. A signpost from `audit.md` command doc to the example
   file would speed up customisation.

## Missing conventional files

- **`CODEOWNERS`** — none. `.claude/` and `src/backend|frontend|infra`
  would all benefit from auto-assignment.
- **`.github/ISSUE_TEMPLATE/`** — none. A template for "Framework bug"
  vs "Agent prompt-tuning request" vs "New command proposal" would
  structure external contributions.
- **`.github/PULL_REQUEST_TEMPLATE.md`** — none. Would ensure PRs
  document which `.claude/` subsystem they touch and whether they
  require a re-bootstrap.
- **`SECURITY.md`** — none. Low priority for a framework, but nice to
  have (reporting channel for supply-chain concerns in
  `package-lock.json`).
- **`LICENSE`** — not verified in this audit; should confirm separately.

## Documentation drift risk signals

From `02-git-history.md`:
- `README.md` is the #1 churn file (5 commits in 6 months). It evolves
  fastest, so drift against `.claude/commands/` and `.claude/agents/`
  is the most likely place for cross-doc mismatches.
- `CLAUDE.md` has been committed 3 times but remains effectively
  empty — those commits are re-statements of the placeholder, not
  content.
- `AGENTS.md` has been updated 3 times; `.claude/agents/*` have varied
  churn (dev-platform.md at 3 commits, pm.md at 1). A silent skew is
  plausible.

## What's well-documented — positive examples to replicate

1. **`.claude/rules/pipeline.md`** — machine-readable stage-by-stage
   definition; every stage has input, output, gate file, and gate key.
   The orchestrator can (and does) read this deterministically.
2. **`.claude/rules/gates.md`** — full JSON schema per stage, including
   retry protocol. Perfect reference doc.
3. **`AGENTS.md`** — single-file summary serving Claude Code, Cursor,
   Copilot. Cross-tool compat is explicit.
4. **Command frontmatter** — every `.claude/commands/*.md` starts with
   a `description:` YAML block used by the slash-command picker.
   Consistent format, no drift.

## Summary of actionable items

Pulled into the P1/P2 backlog (`09-backlog.md`):

| Item | Section | Priority |
|---|---|---|
| Fix `docs/faq.md:27` stale gitignored claim | S1 | P1 quick win |
| Add `orchestrator.md` to README project structure | R1 | P1 quick win |
| Add `test:integration` script or remove from CONTRIBUTING | C3 | P1 quick win |
| Cross-doc sync test (agents + commands) | C1, C2 | P2 |
| Populate or remove empty `CLAUDE.md` | Onboarding #1 | P2 |
| Link `EXAMPLE.md` from README | Onboarding #4 | P1 quick win |
| Section markers in `build-presentation.js` | I2 | P3 |
| Add CODEOWNERS + PR template | Missing files | P3 |
