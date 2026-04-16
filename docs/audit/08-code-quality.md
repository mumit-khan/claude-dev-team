# 08 — Code Quality

_Generated: 2026-04-16_

## Context

The repo has 56 files, of which only three contain executable code:

| File | LOC | Purpose |
|---|---|---|
| `.claude/hooks/gate-validator.js` | 89 | Gate-file validator hook |
| `bootstrap.sh` | 167 | Framework installer |
| `docs/build-presentation.js` | 686 | Slide deck builder |

Everything else is Markdown prose (agent/command/skill/rule
definitions, docs, audit output, tests are JS but live under
`tests/`). Code quality analysis focuses on those three files and on
the cross-cutting quality of the Markdown configuration surface.

## Scope by churn

From `02-git-history.md`, highest-churn code files are:
- `bootstrap.sh` (3 commits, 6 months)
- `docs/build-presentation.js` (3 commits)
- `.claude/hooks/gate-validator.js` (stable since 2026-04-02)

Highest-churn prose files are `pipeline.md`, `dev-platform.md`,
`reset.md` — reviewed for content quality, not code quality.

## 1. Duplication

### Finding CQ-1 — `PostToolUse` lint hook duplicated across 3 agents — LOW

- Files: `.claude/agents/dev-backend.md:16-20`,
  `dev-frontend.md:16-20`, `dev-platform.md:16-20`
- Effort: Small | Impact: Low | Confidence: HIGH
- Identical 5-line PostToolUse block in all three dev agents:
  ```yaml
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "cd $(git rev-parse --show-toplevel) && npm run lint --if-present 2>&1 | tee -a pipeline/lint-output.txt || true"
  ```
- Maintenance risk: if the lint command changes, 3 files must be updated
  in lockstep. No test asserts they stay in sync.
- Claude Code's agent format does not currently support shared hook
  definitions (would need a `.claude/hooks/shared.yml` or similar).
- **Assessment: intentional duplication**, but worth a sync test. Filed
  under finding C1 in `05-documentation.md`.

### Finding CQ-2 — "On a Code Review Task" scaffolding duplicated — LOW

- Files: `.claude/agents/dev-backend.md`, `dev-frontend.md`,
  `dev-platform.md` (each ~20 lines)
- Effort: Small | Impact: Low | Confidence: HIGH
- Each dev agent has a "When Invoked for Code Review" section with the
  same classification vocabulary (BLOCKER / SUGGESTION / QUESTION),
  the same pre-read list, and the same output file contract. Only the
  focus areas differ (backend = API correctness, frontend = XSS,
  platform = testability).
- **Assessment: intentional.** Each agent must be self-contained. The
  `review-rubric` skill is the shared knowledge base; inline text is
  role-specialised. No action.

### Finding CQ-3 — slide helper call signature repetition — LOW

- File: `docs/build-presentation.js` (throughout)
- Effort: Medium | Impact: Low | Confidence: HIGH
- 156 `addShape`/`addText` calls across 18 slide functions. Each
  specifies `x, y, w, h` in inches with literal numbers. There is no
  grid abstraction, no layout template. Copy-paste is the dominant
  mode.
- **Assessment: acceptable for a one-shot slide script.** Refactoring
  to a layout DSL would be more code, not less. Noted, no action.

### Finding CQ-4 — gate-file required fields repeated across tests and prose — LOW

- Files: `.claude/rules/gates.md:7-14`,
  `.claude/hooks/gate-validator.js:47`,
  `tests/gate-validator.test.js` (multiple places)
- Effort: Small | Impact: Low | Confidence: HIGH
- The six required base fields (`stage, status, agent, timestamp,
  blockers, warnings`) appear as a literal list in three places. A
  future addition (say `pipeline_id`) requires three edits.
- **Fix (P2):** export the list from a small shared module in
  `.claude/hooks/` so the validator and tests import it.

## 2. Complexity hotspots

### Finding CQ-5 — `build-presentation.js` slide functions are long — LOW

- File: `docs/build-presentation.js`
- Effort: Medium | Impact: Low | Confidence: HIGH
- Slide functions average 30-60 LOC each; the longest
  (`slideBuildPhases` et al.) exceed 50 lines of sequential `addText`
  and `addShape` calls with magic numbers. Cyclomatic complexity is
  near 1 (straight-line) — easy to read, tedious to edit.
- **Assessment: linear complexity is OK for slide building.** A
  `describe slides declaratively` refactor is tracked in Batch 4 of
  the old roadmap and deliberately not pursued further.

### Finding CQ-6 — bootstrap.sh is 167 LOC of imperative steps — LOW

- File: `bootstrap.sh`
- Effort: Small | Impact: Low | Confidence: HIGH
- Straight-line Bash, no functions, no loops (except the `.gitignore`
  appender's 17-line echo block). Adequately commented with section
  dividers. Trivial to read.
- **No action.**

### Finding CQ-7 — gate-validator nests status handling shallowly — ✅

- File: `.claude/hooks/gate-validator.js`
- Effort: — | Impact: — | Confidence: HIGH
- Three top-level `if (status === "X")` branches, each returns via
  `process.exit`. No nested branching. Max cyclomatic complexity ~5.
  Healthy.

## 3. Dead code

### Finding CQ-8 — `lint:frontmatter` script is redundant — LOW

- File: `package.json:10`
- Effort: XS | Impact: Low | Confidence: HIGH
- `"lint:frontmatter": "node --test tests/frontmatter.test.js"` runs
  only the frontmatter test. `npm test` already includes it via the
  `tests/**/*.test.js` glob. Neither CI nor CONTRIBUTING.md invokes
  the dedicated script.
- Pulled into `03-compliance.md` finding C2 and roadmap P2 as a
  cleanup. Either document the use case (e.g., "fast feedback loop on
  YAML frontmatter during agent edits") or remove.

### Finding CQ-9 — no dead code in executable JS — ✅

- Files: `gate-validator.js`, `build-presentation.js`
- Grep for unused imports, unreachable branches, commented-out blocks:
  none found. `eslint` `recommended` flags the obvious cases; CI
  runs lint. Clean.

### Finding CQ-10 — README references three commands without agent/skill backing — LOW

- Files: `README.md` vs `.claude/commands/`
- Effort: XS | Impact: Low | Confidence: HIGH
- README's "When to Use What" table references `/audit-quick`,
  `/health-check`, `/roadmap`, `/principal-ruling`, `/adr`. All exist
  in `.claude/commands/`. No dangling references.
- Inverse check: 5 commands in `.claude/commands/` are NOT surfaced in
  the README decision table (`design`, `ask-pm`, `reset`, `resume`,
  `stage`, `pipeline-context`, `status`). Covered in `AGENTS.md`.
  **Not dead code** but discoverability gap — see finding R2 in
  `05-documentation.md`.

### Finding CQ-11 — `.claude/references/audit-extensions-example.md` is for users — ✅

- File: `.claude/references/audit-extensions-example.md`
- Confidence: HIGH
- File exists as a template for contributors. Not imported by the
  framework. Correct — it's a reference, not code.

## 4. Abstraction health

### Finding CQ-12 — gate-validator single-file design is appropriate — ✅

- File: `.claude/hooks/gate-validator.js`
- Confidence: HIGH
- 89 LOC, one file, one responsibility (read latest gate, validate
  required fields, exit with correct code). No abstraction inversion
  or over-abstraction. Good.

### Finding CQ-13 — bootstrap.sh has no function decomposition — LOW

- File: `bootstrap.sh`
- Effort: Small | Impact: Low | Confidence: HIGH
- All logic lives at the top level. Helper functions
  (`preflight()`, `copy_framework()`, `create_project_files()`,
  `update_gitignore()`) would give better section markers and allow
  easier unit testing.
- **Fix (P3):** decompose into functions. Cosmetic improvement; not
  urgent.

### Finding CQ-14 — agent frontmatter schema is implicit — MEDIUM

- Files: `.claude/agents/*.md`, `tests/frontmatter.test.js`
- Effort: Small | Impact: Medium | Confidence: HIGH
- The test enumerates required fields (`name, description, tools,
  model, color, priority, role`). There is no formal schema (JSON
  Schema, TypeScript type, etc.). A newcomer adding an agent must
  discover required fields by reading the test.
- **Fix (P2):** publish `.claude/schemas/agent.schema.json` and
  reference it from the test. Also helps editor IntelliSense.

### Finding CQ-15 — gate schema lives in prose — MEDIUM

- File: `.claude/rules/gates.md`
- Effort: Small | Impact: Medium | Confidence: HIGH
- Same shape as CQ-14. Gate JSON schema is documented in prose plus
  inline JSON samples. No machine-readable schema. The validator has
  to be hand-coded to match, which is why PERF-9 exists (stage-specific
  fields aren't validated).
- **Fix (P1, high priority):** publish
  `.claude/schemas/gate.schema.json` covering base + each stage's extras.
  The validator becomes a thin wrapper around a schema check (e.g.,
  `ajv`). Removes finding PERF-9 entirely.

### Finding CQ-16 — pipeline rules are the right altitude — ✅

- Files: `.claude/rules/pipeline.md`, `orchestrator.md`, `gates.md`,
  `escalation.md`, `compaction.md`
- Confidence: HIGH
- Clean separation of concerns: orchestrator.md = top-level;
  pipeline.md = stage-by-stage; gates.md = schema; escalation.md =
  halt protocol; compaction.md = context preservation. No overlap,
  no duplication. Exemplary.

## 5. Naming & clarity

### Finding CQ-17 — inconsistent quote style in JS — LOW

- Files: `.claude/hooks/gate-validator.js` (double quotes),
  `docs/build-presentation.js` (mixed), `tests/*.js` (mostly double)
- Effort: XS | Impact: Low | Confidence: HIGH
- `eslint.config.js` uses `js.configs.recommended` only — the `quotes`
  rule is not enforced. Style drift is invisible to CI.
- Pulled into `03-compliance.md` finding B3. **Fix (P2):** add
  `"quotes": ["error", "double"]` (or single — pick one and document)
  to `eslint.config.js`.

### Finding CQ-18 — magic numbers in slide builder — LOW

- File: `docs/build-presentation.js`
- Effort: Small | Impact: Low | Confidence: HIGH
- Layout coordinates (`x: 0.8, y: 1.6, w: 0.6, h: 0.6`) are in inches
  but that is not stated. Constants like `transparency: 50`,
  `opacity: 0.08`, `shadow: { blur: 4, offset: 1, angle: 135 }` are
  design choices with no rationale.
- **Fix (P3):** extract a `LAYOUT` object with named constants
  (`SLIDE_W_INCHES`, `CARD_SHADOW`, etc.). Part of the
  `build-presentation.js` cleanup already mentioned in PERF-2 / I2.

### Finding CQ-19 — gate-validator has minimal inline comments — LOW

- File: `.claude/hooks/gate-validator.js`
- Effort: XS | Impact: Low | Confidence: HIGH
- Top-of-file header comment is good. The mtime-sort on line 29 has
  no comment explaining *why* (pick the latest = most recent stage).
  Also the exit-code mapping (0/1/2/3) is documented only in the
  header.
- **Fix (P3):** two inline comments, ~5 LOC.

### Finding CQ-20 — agent "name" vs filename convention is un-stated — LOW

- Files: `.claude/agents/*.md`, `tests/frontmatter.test.js:147-160`
- Effort: XS | Impact: Low | Confidence: HIGH
- The test asserts `filename matches name` (stripped of `.md` and
  kebab-casing rules). No documentation states this convention for
  new-agent authors.
- **Fix (P2):** one line in `CONTRIBUTING.md`.

## 6. Dependency health

### Finding CQ-21 — devDependencies are all reasonable — ✅

- File: `package.json`
- Confidence: HIGH
- 8 devDeps, all caret-ranged:
  - `@eslint/js@^9.0.0`, `eslint@^9.0.0`, `globals@^15.0.0` — lint
  - `pptxgenjs@^3.12.0`, `sharp@^0.33.5`, `react@^18.3.1`,
    `react-dom@^18.3.1`, `react-icons@^5.4.0` — presentation only
  - No prod deps (framework is code-free at runtime).
- `npm audit` reports 0 vulnerabilities (SEC-9). Lockfile committed.

### Finding CQ-22 — `react`/`react-dom`/`sharp` only needed for presentation — LOW

- File: `package.json`
- Effort: Small | Impact: Low | Confidence: HIGH
- Five dependencies (`pptxgenjs`, `react`, `react-dom`, `react-icons`,
  `sharp`) exist solely for `docs/build-presentation.js`. A
  contributor working only on framework internals still installs all
  of them — `sharp`'s native binding step takes 10-20 s and can fail
  on unusual platforms (Alpine, ARM without prebuilt binaries).
- **Fix (P3):** move presentation deps to `optionalDependencies` or
  split `docs/` into a subpackage with its own `package.json`. Trade-
  off: added complexity for a rare case. Probably not worth it.

### Finding CQ-23 — no outdated-dependency check — LOW

- Effort: XS | Impact: Low | Confidence: HIGH
- Related to SEC-10 (no Dependabot). Without a recurring signal, deps
  can age silently. The caret ranges allow automatic minor updates on
  `npm install`, but CI uses `npm install` anyway (SEC-11), so version
  drift is possible across CI runs.

## Summary

| # | Finding | Effort | Impact | Confidence |
|---|---|---|---|---|
| CQ-1 | PostToolUse hook duplicated in 3 agents | S | L | HIGH |
| CQ-2 | Code-review instructions duplicated | S | L | HIGH |
| CQ-3 | Slide helper call-site repetition | M | L | HIGH |
| CQ-4 | Gate required-fields repeated across 3 places | S | L | HIGH |
| CQ-5 | Slide functions 30-60 LOC each | M | L | HIGH |
| CQ-6 | bootstrap.sh is flat imperative | S | L | HIGH |
| CQ-7 | Validator complexity healthy | — | — | HIGH ✅ |
| CQ-8 | `lint:frontmatter` redundant script | XS | L | HIGH |
| CQ-9 | No dead code in JS | — | — | HIGH ✅ |
| CQ-10 | 5 commands not in README table | XS | L | HIGH |
| CQ-11 | audit-extensions-example is correct | — | — | HIGH ✅ |
| CQ-12 | Validator single-file design fits | — | — | HIGH ✅ |
| CQ-13 | bootstrap.sh no function decomposition | S | L | HIGH |
| CQ-14 | Agent frontmatter schema is implicit | S | **M** | HIGH |
| CQ-15 | Gate schema lives only in prose | S | **M** | HIGH |
| CQ-16 | Pipeline rules well-separated | — | — | HIGH ✅ |
| CQ-17 | Inconsistent quote style (no rule) | XS | L | HIGH |
| CQ-18 | Magic numbers in slide builder | S | L | HIGH |
| CQ-19 | Minimal inline comments in validator | XS | L | HIGH |
| CQ-20 | Filename↔name convention un-documented | XS | L | HIGH |
| CQ-21 | devDeps clean | — | — | HIGH ✅ |
| CQ-22 | React/sharp optional for framework work | S | L | HIGH |
| CQ-23 | No outdated-dep check | XS | L | HIGH |

**Zero high-impact findings that aren't already covered elsewhere.**

Two medium-impact findings worth P1/P2 roadmap attention:

- **CQ-15** — gate schema in prose only. This is the root cause of
  PERF-9 (validator doesn't check stage-specific fields). Fixing CQ-15
  (publish a JSON Schema) + using `ajv` is one change that resolves
  both PERF-9 and U4 in `04-tests.md`. **Promote to P1.**
- **CQ-14** — agent frontmatter schema is implicit. Lower urgency but
  pairs well with CQ-15. **P2.**

Everything else is L/XS and clustered into roadmap clean-up PRs.

## What's well-written — positive examples

1. **`.claude/hooks/gate-validator.js`** — 89 LOC, one responsibility,
   zero deps beyond `fs`/`path`, fully tested (13 tests covering PASS/
   FAIL/ESCALATE/malformed JSON/missing fields). Template for all
   future hooks.
2. **`.claude/rules/*.md`** — five files, one concern each, no
   overlap. Machine-readable for the orchestrator and readable for
   humans.
3. **`tests/frontmatter.test.js` data-driven structure** — generates
   tests from `fs.readdirSync(AGENTS_DIR)`; new agents auto-covered.
   Still carries the caveat from `04-tests.md` Q2 (hand-rolled YAML
   parser).
4. **`bootstrap.sh` safety** — `set -e`, quoted paths, rsync excludes
   for local overrides, `.gitignore` appender idempotent at the
   block level. No command-injection surface.
