# 04 — Test Health

_Generated: 2026-04-16_

## Summary

- **Test files:** 4 under `tests/` (642 LOC total).
- **Tests (individual `it()`):** 47 in source; `npm test` reports
  **98 tests across 16 suites** (node:test counts nested describe blocks
  as suites and every assertion-group as a subtest).
- **Status:** **All 98 pass** on a system with `rsync` available.
  In environments without `rsync` (e.g., minimal Docker images, this
  sandbox pre-install), 17 `bootstrap.test.js` tests fail deterministically
  — not a code bug, a preflight dependency issue (see §Infrastructure).
- **Runner:** `node:test` + `node:assert/strict`; no external framework.
- **CI:** `.github/workflows/test.yml` runs `npm install && npm run lint
  && npm test` on Node 20 and 22 (ubuntu-latest).

## Coverage map

| Component | Test file | Tests | Type | Notes |
|---|---|---|---|---|
| `.claude/hooks/gate-validator.js` | `gate-validator.test.js` | 13 | Unit (subprocess) | Exhaustive: PASS/FAIL/ESCALATE exit codes, missing-fields validation, malformed JSON, multiple files, non-JSON files, warnings. |
| `bootstrap.sh` | `bootstrap.test.js` | 18 | Integration (tmp dir) | Broad: directory creation, idempotency, `*.local.*` preservation, gitignore append, `src/` handling. |
| `.claude/agents/*.md` YAML frontmatter | `frontmatter.test.js` | per-agent × 5 × 7 fields + 6 skill checks | Lint | Required fields, model whitelist, filename↔name match. |
| `.claude/skills/*/SKILL.md` | `frontmatter.test.js` | Same file | Lint | Existence, non-empty, starts with frontmatter-or-heading. |
| `docs/build-presentation.js` | `smoke-presentation.test.js` | 1 | Syntax-only | `node --check`; no layout or output validation. |

## Untested critical paths

### U1. `bootstrap.sh` cross-platform matrix — MEDIUM

CI runs `ubuntu-latest` only. macOS support is promised in
`CONTRIBUTING.md:63` but not exercised. BSD-style `sed`/`awk` flavor
differences are a common source of Bash portability bugs.

### U2. `bootstrap.sh` preflight failures — HIGH

`bootstrap.sh:34-38` hard-fails on missing `node`, `git`, or `rsync`.
Only "fails if target directory does not exist" is tested. The other
three preflight paths are unverified — a future change to any of the
`command -v` checks could silently break them.

### U3. `gate-validator.js` multi-gate edge cases — MEDIUM

`"picks the most recently modified gate file"` covers the mtime sort.
Untested:
- Ties (two files with identical mtime): behaviour depends on sort
  stability.
- Reading a gate file mid-write (race with an agent still writing JSON).
- Very large gate files (>1 MB).

### U4. Stage-specific gate schema — **HIGH**

`gate-validator.js:47` checks only the six **required** fields. It does
**not** validate the stage-specific extras in `.claude/rules/gates.md`
(e.g., stage-02 needs `arch_approved`, `pm_approved`, `adr_count`;
stage-05 needs `approvals[]` and `changes_requested[]`). An agent could
write `stage-05.json` with `"status": "PASS"` but no `approvals` array,
and the hook would report PASS. **Single biggest test gap.** Pulled
into the backlog as a P1.

### U5. `/pipeline` and `/audit` flows end-to-end — LARGE

No tests exercise the pipeline or audit commands (they are
Claude-Code-interpreted markdown, not invokable programmatically). Full
E2E would require mocking the Claude Code runtime. Out of scope for
this test suite; call out as a known limitation.

### U6. `docs/build-presentation.js` output fidelity — MEDIUM

The only assertion is `node --check` for syntax. The Batch 4 refactor
claim that output is "byte-identical before/after" is **not** verified
by any test. A canary test that renders once and asserts on slide count
or output size would guard against accidental layout regressions.

### U7. Cross-document integrity — MEDIUM

- `AGENTS.md` agent list vs `.claude/agents/*.md` — no test verifies
  they stay in sync (see finding E2 in `03-compliance.md`).
- README command list vs `.claude/commands/*.md` — same.
- `CONTRIBUTING.md` testing instructions vs `package.json` scripts —
  same.

### U8. `settings.json` permission allowlist drift — LOW

If a new agent adds a `Bash(...)` invocation not covered by
`permissions.allow`, the first runtime interaction will prompt. Low
value to automate; the allowlist is target-project-biased by design.

## Test quality issues

### Q1. `bootstrap.test.js` 30 s timeout — LOW

A slow CI runner could hit 30 s on npm install/apt. Consider raising to
60 s for headroom. Not observed to fail today.

### Q2. `frontmatter.test.js` hand-rolled YAML parser — **MEDIUM**

`tests/frontmatter.test.js:15–73` parses YAML with a custom regex-based
function. It handles `key: value`, `key: >\n  …` (block scalar), and
empty keys — but **doesn't handle YAML list syntax**. The `tools:` field
works today only because the agent files happen to use
`tools: Read, Write, ...` rather than:

```yaml
tools:
  - Read
  - Write
```

If an agent author ever writes the list form, the parser will report
missing fields — a misleading failure. The test's correctness depends
on a convention that is never enforced by the parser itself.

**Suggested fix:** replace the parser with a lightweight YAML lib (e.g.,
`yaml` package) or explicitly document the constraint inline.

### Q3. `smoke-presentation.test.js` is a bare syntax check — MEDIUM

Only asserts that `node --check` passes. Catches nothing semantic. A
render-once-to-buffer check (asserting 18 slides and a positive byte
count) would be a small, valuable upgrade.

### Q4. Subprocess invocation cost — LOW

Gate-validator tests spawn Node 13× per file (~70 ms each). Fine at
current scale; worth noting if the suite grows large.

### Q5. Empty assertions / overbroad mocks — NONE FOUND

No `assert.ok(true)` stubs and no mocks at all (tests use real tmp dirs,
real subprocesses, real filesystem). Healthy.

### Q6. Order-dependence — NONE FOUND

All integration tests use `beforeEach`/`afterEach` tmp-dir setup. No
shared state.

### Q7. External service calls — NONE FOUND

No tests hit the network.

## Test infrastructure

- **Runner:** `node --test 'tests/**/*.test.js'` — clean and standard.
- **Coverage tool:** **none.** `node --test --experimental-test-coverage`
  (or `--test-coverage` in Node 22+) would give us text-summary and LCOV
  without new dependencies. Adding it is a P1 quick win.
- **CI matrix:** Node 20 + 22, Linux only. No macOS job despite
  CONTRIBUTING.md promising macOS support.
- **Pre-commit hooks:** none.
- **Watch mode:** none; fine at current scale.
- **Test timing:** ~8 s total (bootstrap integration tests dominate,
  18 × ~400 ms).

## What's well-tested — positive examples to replicate

1. **`gate-validator.test.js`** — exemplary CLI-script testing: exit
   codes, stdout/stderr separation, happy + error paths, multiple
   permutations. Every branch of the hook is covered.
2. **`bootstrap.test.js` idempotency assertion** — explicitly runs
   `run(target)` twice and checks for single-occurrence of pipeline
   gitignore entries. Matches the "idempotent bootstrap" contract in
   `CONTRIBUTING.md`.
3. **`frontmatter.test.js` data-driven structure** — tests are generated
   from `fs.readdirSync(AGENTS_DIR)`. Adding a new agent automatically
   gets it tested with no test edits.
4. **Temp-directory cleanup** — every integration test uses
   `fs.mkdtempSync` + `afterEach` cleanup. No state leaks.

## Risks to the test suite itself

- **`rsync` dependency** — tests fail silently in rsync-less
  environments. A preflight check or a documented skip marker would
  help contributors diagnose quickly.
- **Node version matrix drift** — CI runs 20 and 22; `package.json` has
  no `engines` field and CONTRIBUTING.md says "Node.js 20+". Silent
  breakage possible if Node-18-only APIs are used locally.
- **No coverage floor** — no CI enforcement that new code ships with
  tests. `review-rubric/SKILL.md:25–27` calls this a BLOCKER in Stage 5
  peer review, but there is no machine gate.
