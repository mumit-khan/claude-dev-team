# 01 — Architecture Map

_Generated: 2026-04-16_

## Caveat

This repo is a **framework/template**, not a service with a request path.
"Architecture" here means: the payload of `.claude/` that Claude Code
consumes at runtime, the installer that deploys it, the test & lint
tooling around those, and the side presentation-builder. There is no HTTP
API, no data store, no daemon.

---

## Component inventory

### 1. Orchestrator configuration — `CLAUDE.md` + `.claude/rules/`

- **Purpose:** Instruct Claude Code how to run the pipeline. Read on every
  session.
- **Entry point:** `CLAUDE.md` (loaded automatically by Claude Code).
- **Files:**
  - `CLAUDE.md` — currently a near-empty placeholder; the framework ships
    orchestrator logic under `.claude/rules/orchestrator.md` instead.
  - `.claude/rules/orchestrator.md` — top-level team/pipeline intro (51 lines).
  - `.claude/rules/pipeline.md` — 8-stage pipeline (169 lines). Authoritative.
  - `.claude/rules/gates.md` — JSON gate schema (80 lines).
  - `.claude/rules/escalation.md` — escalation protocol (41 lines).
  - `.claude/rules/compaction.md` — context-compaction rules (16 lines).
- **Internal deps:** consumed by all commands and all agents.

### 2. Agent definitions — `.claude/agents/`

5 agents, each a single markdown file with YAML frontmatter (`name`,
`description`, `tools`, `model`, `permissionMode`, optional `skills` and
`hooks`):

| File | Role | Model | Scope |
|---|---|---|---|
| `pm.md` | Product Manager | opus | pipeline/ only |
| `principal.md` | Principal Engineer | opus | Read/Write/Grep/Glob/Bash |
| `dev-backend.md` | Backend Dev | sonnet | `src/backend/` |
| `dev-frontend.md` | Frontend Dev | sonnet | `src/frontend/` |
| `dev-platform.md` | Platform/QA Dev | sonnet | `src/infra/` + deploy |

- `dev-platform.md` embeds a deep **deploy runbook** (docker compose build,
  up --wait, smoke checks, log capture) — most complex agent (207 lines).
- Each dev loads `skills: [code-conventions, security-checklist,
  review-rubric]` via frontmatter.
- `dev-platform` also defines a `PostToolUse` hook that runs `npm run lint`
  after any Write/Edit.

### 3. Slash commands — `.claude/commands/`

18 markdown files, each a slash-command workflow. Groups:

- **Pipeline lifecycle** — `pipeline`, `pipeline-brief`, `pipeline-review`,
  `pipeline-context`, `status`, `stage`, `resume`, `reset`, `hotfix`,
  `design`, `ask-pm`, `adr`, `principal-ruling`.
- **Audit/improvement** — `audit`, `audit-quick`, `health-check`, `roadmap`,
  `review`.

### 4. Skills — `.claude/skills/`

6 skill bundles, each a directory containing a `SKILL.md`:

- `code-conventions/` — cross-cutting coding standards (naming, error
  handling, logging, testing, git discipline).
- `api-conventions/` — REST/JSON shape, pagination, error envelopes.
- `security-checklist/` — input validation, authz, secrets, deps.
- `review-rubric/` — Stage 5 code-review checklist.
- `implement/` — plan → execute → verify flow for focused changes.
- `pre-pr-review/` — pre-merge review flow used by `/review`.

### 5. Gate-validator hook — `.claude/hooks/gate-validator.js`

- **Purpose:** Deterministic read of the most recent gate JSON. Exits
  `0/2/3` for PASS/FAIL/ESCALATE so Claude Code's SubagentStop/Stop hooks
  can halt or retry.
- **Scope:** 89 LOC. Uses only Node built-ins (`fs`, `path`).
- **Entry point:** Invoked by Claude Code via hook registration in
  `.claude/settings.json`.
- **Validation:** checks presence of required fields (`stage`, `status`,
  `agent`, `timestamp`, `blockers`, `warnings`) and recognizes `PASS`,
  `FAIL`, `ESCALATE`. Does **not** validate stage-specific fields
  described in `.claude/rules/gates.md`.

### 6. Bootstrap installer — `bootstrap.sh`

- **Purpose:** Copy `.claude/` and `AGENTS.md` into a target repo via
  `rsync -a --exclude='*.local.*' --exclude='settings.local.json'`.
  Create empty `pipeline/`, `src/` substructure, make the hook executable,
  append pipeline entries to target `.gitignore` idempotently.
- **Scope:** 167 LOC Bash. Idempotent by design.
- **Preflight:** checks `node`, `git`, `rsync`, warns on missing `claude` CLI.
- **AGENTS.md behavior:** the script claims (lines 73–79) to "Create…only
  if it doesn't exist" then actually copies unconditionally — either
  create or update. That contradicts the README's "`CLAUDE.md`, `pipeline/context.md`, `src/`, and all `*.local.*` files are untouched" framing, though AGENTS.md is in fact framework-owned. Cosmetic: the
  "Created" vs "Updated" log line is correct.

### 7. Presentation builder — `docs/build-presentation.js`

- **Purpose:** Generate an 18-slide `.pptx` deck summarising the framework
  for demos/evangelism.
- **Scope:** 686 LOC. Uses `pptxgenjs`, React SSR, `sharp` (for SVG→PNG of
  react-icons).
- **Internal deps:** none — pure content + layout. Not invoked at runtime
  by any other code.

### 8. Test suite — `tests/`

- `bootstrap.test.js` (194 LOC) — integration tests; spawns `bootstrap.sh`
  against a tmp dir, asserts file presence/content/idempotency.
- `frontmatter.test.js` (174 LOC) — validates every agent and skill has
  well-formed YAML frontmatter.
- `gate-validator.test.js` (255 LOC) — exhaustive exit-code/stdout tests
  for the hook.
- `smoke-presentation.test.js` (19 LOC) — `node --check` syntax-only test
  for `build-presentation.js` (no functional coverage).

### 9. CI — `.github/workflows/test.yml`

- Matrix: ubuntu-latest × Node 20/22.
- Steps: checkout → install rsync → `npm install` → `npm run lint` → `npm test`.

### 10. ESLint — `eslint.config.js`

- Flat config, ESLint 9, `@eslint/js` recommended rules, CommonJS, Node
  globals.

---

## Dependency graph (internal)

```
                 ┌─────────────────┐
                 │   bootstrap.sh  │  (one-way: source → target project)
                 └────────┬────────┘
                          │ rsync -a
                          ▼
                 ┌─────────────────┐
                 │    .claude/     │  (framework payload)
                 └────────┬────────┘
                          │
        ┌─────────────────┼───────────────────┐
        ▼                 ▼                   ▼
    agents/          commands/            skills/
        │                 │                   │
        └────┬────────────┘                   │
             │ consumed by orchestrator       │
             ▼                                │
      rules/*.md  ◄─────── settings.json ─────┤
             │                                │
             └─── hooks/gate-validator.js ◄───┘

tests/  ──►  .claude/hooks/gate-validator.js          (integration)
tests/  ──►  bootstrap.sh                             (integration)
tests/  ──►  .claude/agents/ + .claude/skills/         (lint)
tests/  ──►  docs/build-presentation.js               (syntax check)

docs/build-presentation.js   (standalone — no other code depends on it)
```

**Circular deps:** None at the code level. Markdown files cross-reference
each other heavily (e.g., `pipeline.md` references `gates.md`,
`escalation.md`, `compaction.md`), but this is documentation coupling,
not code.

**High fan-in:**
- `.claude/rules/pipeline.md` is read by ≥18 commands.
- `.claude/rules/gates.md` is read by every agent that writes a gate.
- `CLAUDE.md` is loaded every session (but is currently empty).

---

## External integrations

| Integration | Where used | Abstracted? |
|---|---|---|
| `rsync` | `bootstrap.sh` | Direct CLI call |
| `git` | `bootstrap.sh` preflight + test assertions + `/pipeline` worktrees | Direct CLI |
| `node` | all JS files | Direct |
| `docker compose` | `dev-platform.md` deploy runbook (target-project runtime only) | Direct CLI |
| `pptxgenjs` | `docs/build-presentation.js` | Direct import |
| `react` / `react-dom/server` | `docs/build-presentation.js` (icon rendering only) | Direct |
| `react-icons` | `docs/build-presentation.js` | Direct |
| `sharp` | `docs/build-presentation.js` (SVG→PNG) | Direct; requires native binary |
| ESLint 9 + `@eslint/js` + `globals` | `eslint.config.js` | Direct |

No databases, APIs, cloud services, or secrets at runtime of this repo.
The `dev-platform` deploy runbook uses `.env` placeholders but the
framework itself ships no `.env`.

---

## Data flow (primary flows)

### Flow A — Contributor workflow (changes to the framework)

1. Edit a `.claude/**.md` file or `gate-validator.js` or `bootstrap.sh`.
2. `npm run lint` (ESLint) + `npm test` (Node test runner) locally.
3. Push → GitHub Actions CI matrix (Node 20/22) runs the same.

### Flow B — Framework installation in a target project

1. User clones this repo and runs `bash bootstrap.sh /path/to/target`.
2. Script preflights → rsyncs `.claude/` → conditionally creates
   `CLAUDE.md`, copies `AGENTS.md`, creates `pipeline/`, creates `src/`
   subdirs, chmods hook, appends `.gitignore` entries.
3. Target's next `claude` session picks up the new agents/commands/rules.

### Flow C — Feature pipeline (inside a bootstrapped target)

`/pipeline "feature request"` →
 Stage 1 (pm) → checkpoint A →
 Stage 2 (principal draft → devs annotate in parallel → principal review) → checkpoint B →
 Stage 3 (open-question sweep) →
 Stage 4 (3 devs in parallel via git worktrees) →
 Stage 5 (peer code review, 2-of-3 approvals per PR) →
 Stage 6 (dev-platform runs full test suite) → checkpoint C →
 Stage 7 (PM sign-off) →
 Stage 8 (dev-platform docker-compose deploy + smoke tests).

Gate files in `pipeline/gates/` mediate every handoff. The hook reads the
most recently modified gate after every agent stop.

### Flow D — Audit pipeline

`/audit` →
 Phase 0 (bootstrap: context, architecture, git history) → checkpoint A →
 Phase 1 (compliance, tests, docs) → checkpoint B →
 Phase 2 (security, performance, code quality) → checkpoint C →
 Phase 3 (backlog, sequenced roadmap).

Outputs: `docs/audit/00`..`10` + `status.json`.

---

## Configuration surface

| Config | Defined in | Consumed by |
|---|---|---|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | `.claude/settings.json` env | Claude Code runtime |
| `permissions.allow` / `.deny` | `.claude/settings.json` | Claude Code permission engine |
| `SubagentStop` / `Stop` hooks | `.claude/settings.json` | Gate validator |
| Agent frontmatter (model/tools/permissionMode) | `.claude/agents/*.md` | Claude Code agent loader |
| `engines` / `.nvmrc` | **absent** | — |
| `.env` / `.env.example` | **absent** in this repo (target projects only) | — |

**Secrets:** none at rest in this repo. The pipeline's target-project
deploy step expects `.env` in the target.

**Feature flags:** only the experimental agent-teams env flag.

---

## What's working well

1. **Deterministic gate schema + hook.** JSON-only gate files + a tiny
   validator make the pipeline auditable without parsing prose. Tests
   cover every exit path (`tests/gate-validator.test.js`).
2. **Idempotent bootstrap.** `.gitignore` append check, `--exclude` for
   `*.local.*`, and existence checks for `CLAUDE.md`/`context.md` let
   users re-run the installer safely to pick up framework updates.
3. **Frontmatter lint.** Every agent file is checked for presence and
   shape of required frontmatter fields (`tests/frontmatter.test.js`) —
   prevents broken agents from shipping.
4. **Strict separation** of framework-owned vs user-owned files makes
   updates low-risk.
5. **Two-tier review.** Stage 5 requires 2-of-3 approvals with a
   Principal escalation path; encoded as a JSON merge protocol rather
   than free-form.
6. **No external runtime deps for the hook.** `gate-validator.js` uses
   only `fs`/`path`, so users don't need a package.json to run it.
7. **CI is minimal and fast.** Node-only, matrix on versions the project
   actually supports.
