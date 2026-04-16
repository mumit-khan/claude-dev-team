# 07 — Performance & Reliability

_Generated: 2026-04-16_

## Context

This is a configuration-as-code framework. Performance here means:

1. How efficiently the gate-validator hook runs (invoked after every
   subagent stop and every main-agent stop).
2. How reliably the bootstrap script works across environments and on
   re-run.
3. How the framework's design affects token consumption and
   wall-clock pipeline time.
4. How gracefully the system degrades when components fail
   (missing rsync, malformed gate, two agents writing simultaneously).

Traditional web-app perf (RPS, tail latency, DB queries, cache hit
rates) does not apply to this repo directly.

## Scope by churn

From `02-git-history.md`, the hot components worth reviewing for
perf/reliability are (in churn order):

1. `bootstrap.sh` (3 commits) — installer, invoked per contributor
2. `docs/build-presentation.js` (3 commits) — slide builder, invoked
   ad-hoc
3. `.claude/hooks/gate-validator.js` (stable since 2026-04-02) —
   invoked ~10-30 times per pipeline run
4. Pipeline rules prose (3 commits each) — guide wall-clock time, not
   CPU time

## 1. Resource lifecycle

### Finding PERF-1 — gate-validator sync IO on every invocation — LOW

- File: `.claude/hooks/gate-validator.js:22-29`
- Impact: Low | Confidence: HIGH
- On every subagent stop, the hook does `readdirSync` + `statSync` per
  gate file, sorts by `mtimeMs`, then `readFileSync` on one file. For
  the expected 8-15 gate files per pipeline run (including retries),
  this is sub-millisecond.
- Edge case: a long-running repo with hundreds of archived gate files
  in `pipeline/gates/` would pay O(N) on every hook invocation. The
  `/reset` command archives gates, so this is bounded in practice.
- **No fix.** Worth noting for `/reset`'s contract: if a user disables
  archival, perf could degrade.

### Finding PERF-2 — presentation builder renders icons sequentially — LOW

- File: `docs/build-presentation.js:611-642`
- Impact: Low | Confidence: HIGH
- 27 icon variants are rendered via `await icon(...)` in a sequential
  object initialiser. Each invocation goes React SSR → sharp PNG →
  base64-encode. Takes several seconds single-threaded.
- The script is a one-shot CLI executed ad-hoc by contributors; no
  hot-path concern.
- **Fix (P3):** `await Promise.all([...])` would cut icon-render time
  by ~70%. Minor quality-of-life for contributors iterating on slide
  design.

### Finding PERF-3 — no shared state in gate-validator — ✅

- File: `.claude/hooks/gate-validator.js` (entire)
- The hook has no caches, no persistent connections, no shared mutable
  state. Each invocation is a fresh Node process (spawned by Claude
  Code hooks). Resource lifecycle is "process lifetime". Clean.

## 2. Concurrency

### Finding PERF-4 — gate-validator race on concurrent subagent stops — MEDIUM

- File: `.claude/hooks/gate-validator.js:22-44`
- Impact: Medium | Confidence: MEDIUM
- Stage 4 invokes `dev-backend`, `dev-frontend`, `dev-platform` in
  parallel. When two finish within the same second, both trigger
  `SubagentStop` hooks. Both hooks read the gates directory and race
  on "pick the latest file by mtime". If mtime resolution is coarse
  (some filesystems only provide second-level mtime), two writes in
  the same second can tie — the sort result is then filesystem-ordering
  dependent.
- Second-order concern: reading a gate file mid-write (partial JSON)
  would throw at `JSON.parse` (line 39) → the hook exits with code 1,
  which Claude Code treats as an error.
- Called out in `04-tests.md` U3 as an untested edge case.
- **Fix (P2):**
  1. Include the agent name in the gate filename
     (`stage-04-backend.json`) — already done per `gates.md`. ✅
  2. In the validator, read *all* pending gates for the current stage,
     not just the latest. Or: write atomically via tmp + rename.
  3. Add a retry wrapper around `JSON.parse` (3× with 10ms backoff)
     for mid-write tolerance.

### Finding PERF-5 — git worktrees are unbounded — LOW

- File: `.claude/rules/pipeline.md:46-49`
- Impact: Low | Confidence: HIGH
- Stage 4 creates three worktrees (`../dev-team-backend`,
  `../dev-team-frontend`, `../dev-team-platform`). No cleanup in the
  pipeline rules. Repeated pipeline runs on the same repo would collide
  on the second run — `git worktree add` fails if the path exists.
- **Fix (P2):** add a `git worktree remove` step to `/reset` so a fresh
  pipeline starts clean. Currently relies on the user to tidy.

### Finding PERF-6 — no mutex on `pipeline/context.md` — LOW

- File: `.claude/rules/compaction.md:4-14`, `pipeline/context.md`
  (scaffold)
- Impact: Low | Confidence: MEDIUM
- Multiple agents can append to `pipeline/context.md` during Stage 4.
  Claude Code's file I/O is serial within a single main agent, but
  across subagents there is no lock. Interleaved writes would produce
  mangled markdown.
- In practice, subagents tend to write only at stage boundaries, so
  the observed risk is low.
- **No fix yet.** Worth a watch-item; escalate to P1 if real pipeline
  runs show corruption.

## 3. Error handling quality

### Finding PERF-7 — bootstrap.sh fails hard on any preflight miss — MEDIUM

- File: `bootstrap.sh:34-40`
- Impact: Medium | Confidence: HIGH
- Preflight checks (`node`, `git`, `rsync`, `claude`, target directory)
  each fail with a one-line error and `exit 1`. Good: fails fast,
  preserves idempotency contract. Bad: the "claude not found" case is
  a **warning** (`⚠️`) but still proceeds — inconsistent with the
  other three which are hard fails.
- Confusing signal: a contributor without Claude Code can run
  `bootstrap.sh` successfully and then wonder why `/pipeline` doesn't
  work.
- **Fix (P2):** either promote the Claude Code check to a hard fail, or
  add "Install Claude Code before starting: ..." to the final echo block.

### Finding PERF-8 — gate-validator collapses all parse errors to exit 1 — LOW

- File: `.claude/hooks/gate-validator.js:40-44, 88-89`
- Impact: Low | Confidence: HIGH
- `JSON.parse` failure → exit 1 ("could not parse"). Missing required
  fields → exit 1 ("INVALID GATE"). Unknown status → exit 1
  ("UNKNOWN status"). All three distinct failure modes emit different
  stderr messages but the same exit code — the orchestrator can't
  distinguish "agent wrote broken JSON" from "agent used a status value
  I don't recognise" from the exit code alone.
- **Fix (P3):** use distinct non-zero exit codes (11, 12, 13) and
  document in `.claude/rules/gates.md`. Low priority — stderr text is
  already distinct for humans.

### Finding PERF-9 — gate-validator does not validate stage-specific schema — HIGH

- File: `.claude/hooks/gate-validator.js:47`
- Impact: High | Confidence: HIGH
- Pulled forward from `04-tests.md` U4 — single biggest functional gap.
  The validator checks only six required base fields
  (`stage, status, agent, timestamp, blockers, warnings`). It does not
  check stage-specific requirements from `.claude/rules/gates.md`:
  - Stage 02 needs `arch_approved`, `pm_approved`, `adr_count`.
  - Stage 05 needs `approvals[]` and `changes_requested[]` with 2
    approvers to PASS.
  - Stage 06 needs `all_acceptance_criteria_met`, `tests_*`,
    `failing_tests[]`, `assigned_retry_to`.
  - Stage 08 needs `environment`, `smoke_test_passed`.
- Reliability impact: an agent writing a malformed stage-05 gate with
  `"status": "PASS"` and zero `approvals` would incorrectly advance
  the pipeline. The human checkpoints A/B/C catch some of this but
  not all stages.
- **Fix (P1, high priority):** add a stage-dispatch validator. ~60 LOC
  of JS in `gate-validator.js`. Tests are the easy part — the schema
  is already spelled out in `gates.md`.

## 4. Timeout discipline

### Finding PERF-10 — gate-validator has no self-timeout — LOW

- File: `.claude/hooks/gate-validator.js` (entire)
- Impact: Low | Confidence: HIGH
- The hook does only sync filesystem ops. No network, no subprocess,
  no promise. A wedged filesystem would block the hook indefinitely,
  which would block the orchestrator.
- Extremely unlikely in practice (local fs). Not worth engineering.
- **No action.**

### Finding PERF-11 — bootstrap.sh has no overall timeout — LOW

- File: `bootstrap.sh` (entire)
- Impact: Low | Confidence: HIGH
- Runs to completion or fails at a preflight/`set -e`. No top-level
  timeout. rsync on a huge target could hypothetically stall, but
  there's no realistic attack or failure vector.
- **No action.**

### Finding PERF-12 — CI has no per-step timeout — LOW

- File: `.github/workflows/test.yml`
- Impact: Low | Confidence: HIGH
- GitHub Actions' default job timeout (6 hours) applies. A broken test
  suite (infinite loop) would consume 6 hours of CI minutes.
- **Fix (P3):** add `timeout-minutes: 10` to the `test` job.

## 5. Scaling concerns

### Finding PERF-13 — pipeline/context.md is append-only and unbounded — LOW

- File: `.claude/rules/compaction.md:16-18`, `pipeline/context.md`
  scaffold
- Impact: Low | Confidence: HIGH
- The context file grows indefinitely across pipeline runs until the
  user runs `/reset`. At ~1 KB per entry and ~10-20 entries per run,
  this becomes a burden only after dozens of runs without reset.
- Claude Code's `/compact` helps by rewriting state, but the on-disk
  file grows forever.
- **Fix (P3):** `/reset` already archives context; document the perf
  contract explicitly ("run /reset between features to keep
  `pipeline/context.md` bounded").

### Finding PERF-14 — 27-icon preload dominates presentation build time — LOW

- File: `docs/build-presentation.js:611-642`
- Impact: Low | Confidence: HIGH
- Same root as PERF-2. Script total wall-clock: ~8-12 s (on a modern
  laptop), dominated by icon rendering. Acceptable for a one-shot.
- **Fix (P3):** `Promise.all` — cuts to ~3-5 s.

### Finding PERF-15 — test suite is 8 s, no parallelism used — LOW

- Impact: Low | Confidence: HIGH
- `node --test` supports parallel test files but the current suite is
  small (4 files, 642 LOC) so total wall time is ~8 s. No action; noted
  for capacity planning if the suite grows 10×.

## 6. Observability

### Finding PERF-16 — no structured logging anywhere — INFO

- Severity: Info | Confidence: HIGH
- gate-validator emits `console.log` / `console.error` with emoji-
  tagged human-readable strings (`[gate-validator] ✅ GATE PASS …`).
  bootstrap.sh uses `echo` with emoji. Good for humans, unparseable
  for tools.
- The orchestrator reads gate files (structured JSON) for machine-
  readable state, so stderr/stdout are genuinely for humans. Acceptable
  design.
- **No action.**

### Finding PERF-17 — no metrics / tracing — INFO

- Severity: Info | Confidence: HIGH
- No timing instrumentation. A pipeline run's per-stage wall-clock is
  observable only via Claude Code's own UI.
- The stage duration table in `pipeline.md:309-327` sets expectations
  but isn't backed by measurement. Potential P3: emit a `timings.json`
  from `/status`.
- **No action now.**

### Finding PERF-18 — no health check for `gate-validator.js` itself — LOW

- Severity: Low | Confidence: HIGH
- If the hook itself is broken (syntax error, missing Node), Claude
  Code would fail to invoke it on every agent stop — the pipeline
  would fail mysteriously.
- There is a test suite (`tests/gate-validator.test.js`, 13 tests) that
  catches this at CI time. ✅ Runtime health check is not worth adding.

## 7. Graceful degradation

### Finding PERF-19 — no graceful fallback if rsync is missing — MEDIUM

- File: `bootstrap.sh:37`
- Impact: Medium | Confidence: HIGH
- Same root finding as `03-compliance.md:A1` and `04-tests.md` environment
  note. The installer hard-fails without rsync; 17 tests fail without
  rsync. No fallback to `cp -r` or `tar | tar`.
- Reliability impact: a contributor on a minimal Docker image or a
  managed dev environment (Coder, Gitpod, devcontainer) hits this as a
  first-run blocker.
- **Fix (P1):** replace rsync with `cp -rn` + a manual excludes loop,
  or add a `--fallback-cp` flag. Already P1 in the backlog.

### Finding PERF-20 — ESCALATE halts but does not kill subagents — LOW

- File: `.claude/rules/escalation.md:23-30`
- Impact: Low | Confidence: MEDIUM
- When the orchestrator sees exit code 3 (ESCALATE), it halts new
  stages. But if a parallel subagent was still running at the time,
  its output still lands — possibly overwriting state the user is
  about to inspect.
- In practice, ESCALATE happens after a full stage completes (agents
  write their gate then exit), so the window is small.
- **No fix needed** unless real usage shows state corruption.

### Finding PERF-21 — Agent Teams "experimental" degrades to sequential — ✅

- File: `README.md:289-292`
- Impact: none | Confidence: HIGH
- Documented fallback: on Agent Teams failure, review falls back to
  sequential reads. Good degradation story.

## Summary

| # | Finding | Impact | Confidence |
|---|---|---|---|
| PERF-1 | Sync fs on every hook invocation | Low | HIGH |
| PERF-2 | Sequential icon render in slide builder | Low | HIGH |
| PERF-3 | Hook is stateless | — | HIGH ✅ |
| PERF-4 | Concurrent subagent-stop race on mtime sort | Medium | MEDIUM |
| PERF-5 | Git worktrees not auto-cleaned | Low | HIGH |
| PERF-6 | `pipeline/context.md` mutex absent | Low | MEDIUM |
| PERF-7 | bootstrap inconsistent Claude-Code check | Medium | HIGH |
| PERF-8 | Validator collapses all failures to exit 1 | Low | HIGH |
| PERF-9 | Validator skips stage-specific schema | **High** | HIGH |
| PERF-10 | No self-timeout in hook | Low | HIGH |
| PERF-11 | No overall bootstrap timeout | Low | HIGH |
| PERF-12 | No per-step CI timeout | Low | HIGH |
| PERF-13 | `pipeline/context.md` append-only | Low | HIGH |
| PERF-14 | Icon preload dominates build time | Low | HIGH |
| PERF-15 | Test suite serial (8 s) | Low | HIGH |
| PERF-16 | No structured logging | Info | HIGH |
| PERF-17 | No metrics/tracing | Info | HIGH |
| PERF-18 | No runtime health-check on validator | Low | HIGH |
| PERF-19 | No rsync fallback in bootstrap | Medium | HIGH |
| PERF-20 | ESCALATE does not kill parallel agents | Low | MEDIUM |
| PERF-21 | Agent Teams degrades to sequential | — | HIGH ✅ |

**One high-impact finding:** PERF-9 — gate-validator does not enforce
stage-specific schema. This is the same gap flagged by `04-tests.md` U4.
Promote to P1 in the backlog.

**Three medium-impact findings:**
- PERF-4 — subagent-stop race (P2; hard to trigger without a load test)
- PERF-7 — bootstrap inconsistent preflight (P2 doc/ UX fix)
- PERF-19 — no rsync fallback (P1; blocks first-run contributors in
  lean environments)

Everything else is Low or Info.
