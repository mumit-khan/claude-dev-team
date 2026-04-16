# 00 — Project Context

_Generated: 2026-04-16 (fresh audit; replaces prior 2026-04-09 snapshot)_

## What this project is

**Claude Code Dev Team** is a framework/template (not a running app) that
installs a simulated software development team into a target repository. It
ships a bundle of agent definitions, slash commands, rules, skills, and hooks
under `.claude/`, plus a `bootstrap.sh` installer. Users run it against their
own project; the team (PM, Principal, 3 devs) runs features through a gated
pipeline: Requirements → Design → Build → Review → Test → Deploy.

Per `CONTRIBUTING.md`: "This is a framework/template, not an application.
There is no `src/` directory in the repo itself — `src/` is created by
`bootstrap.sh` when installing into a target project."

## Languages and frameworks

- **JavaScript (Node.js, CommonJS)** — the only executable code:
  - `.claude/hooks/gate-validator.js` (89 LOC) — validates pipeline gate JSON.
  - `docs/build-presentation.js` (686 LOC) — builds a `.pptx` deck; uses
    `pptxgenjs`, `react-icons`, `react`, `react-dom`, `sharp`.
  - `tests/*.test.js` (642 LOC total) — Node built-in `node:test` runner.
  - `eslint.config.js` — flat-config ESLint 9.
- **Bash** — `bootstrap.sh` (167 LOC) installer; uses `rsync`.
- **Markdown** — the bulk of the codebase: agent definitions, commands,
  skills, rules, references, user-facing docs. Most `.md` files carry YAML
  frontmatter consumed by Claude Code.
- **YAML** — frontmatter in agent/command/skill files; `.github/workflows/test.yml`.
- **JSON** — `.claude/settings.json`, `package.json`, gate files (runtime).

## Build system and dependency manager

- **npm** with `package.json` + `package-lock.json` committed.
- Private package (`"private": true`), no publish flow.
- Node 20+ required per `CONTRIBUTING.md`; CI matrix pins Node 20 and 22.
- `pptxgenjs`, `react`, `react-dom`, `react-icons`, `sharp` are listed in
  `devDependencies` purely to support `docs/build-presentation.js`. They are
  not used at runtime by the framework itself.

## Exact commands

| Action | Command |
|---|---|
| Install deps | `npm install` |
| Run all tests | `npm test` |
| Run integration test only | `npm run test:integration` |
| Lint | `npm run lint` |
| Lint agent frontmatter only | `npm run lint:frontmatter` |
| Bootstrap into a target project | `bash bootstrap.sh /path/to/project` |
| Build the presentation deck | `node docs/build-presentation.js` (needs optional deps) |

There is no "run app" command — the "runtime" is Claude Code itself consuming
the `.claude/` directory.

## Deployment target

Not applicable in the usual sense. "Deployment" = a user runs `bootstrap.sh`
against their own repository, which rsyncs `.claude/` and `AGENTS.md` into
place. There are no container images, cloud services, or servers produced by
this repository.

The **pipeline** the framework orchestrates (in user projects) expects a
deploy target — `.claude/agents/dev-platform.md` has a "On a Deploy Task"
section intended to be customized per user project (defaults to docker
compose).

## Documented conventions

From `CLAUDE.md`, `CONTRIBUTING.md`, `AGENTS.md`, `.claude/rules/`, and the
skills under `.claude/skills/code-conventions/` and `.claude/skills/api-conventions/`:

- Agent/command/skill `.md` files must carry valid YAML frontmatter (enforced
  by `tests/frontmatter.test.js`).
- Gate files are **JSON**, not prose; schema lives in `.claude/rules/gates.md`.
- Append-only context file: `pipeline/context.md`.
- Human checkpoints A/B/C at Stages 1, 2, 6.
- Retry limit: 3 per stage; 3rd identical failure auto-escalates to Principal.
- Tests live in `tests/` with pattern `*.test.js`, use `node:test` +
  `node:assert/strict`, no external test deps.
- Hooks/scripts are exercised as child processes with assertions on exit codes
  and stdout.
- `.claude/` is framework-owned (overwritten by bootstrap); `CLAUDE.md` and
  `*.local.*` are user-owned (preserved).
- Bootstrap must be idempotent and runnable on macOS and Linux.

## Undocumented but implied conventions

- **CommonJS everywhere** (`require`/`module.exports`) — no ESM. Confirmed by
  `eslint.config.js` `sourceType: "commonjs"`.
- **2-space indentation** in JS and JSON.
- **Kebab-case** for command/skill filenames; lowercase for agent filenames.
- **Stage gate file naming**: `stage-NN[-{area}].json`.
- **No TypeScript**; no Prettier config.
- Agent frontmatter shape: `name`, `description`, `tools`, `model`,
  `permissionMode`, optional `skills`, optional `hooks`.

## Codebase size

- **56 tracked files** outside `.git`, `node_modules`, `pipeline/`, and
  `docs/audit/`.
- **~7,200 lines** of content (markdown dominant).
- **~1,600 lines of JavaScript/Bash** across hooks, installer, presentation
  builder, and tests.
- **5 agents**, **18 slash commands**, **6 skills**, **5 rule files**, **1
  hook**, **2 reference files**.

Top-level directories:

```
.claude/         framework payload (agents, commands, skills, rules, hooks, references)
.github/         CI (test.yml)
docs/            user-facing docs (lifecycle, faq, presentation) + audit output
pipeline/        runtime pipeline state (mostly gitignored)
tests/           Node test suite (4 files)
```

## Monorepo vs single app

Single repository, single package — no workspaces, no sub-packages. There is
exactly one `package.json`.

## Surprises and open questions

1. **React/sharp/pptxgenjs are devDependencies** solely to support
   `docs/build-presentation.js`. This bloats `npm install` for contributors
   who never touch the deck and drags a native build of `sharp` into CI.
2. **CI uses `npm install`, not `npm ci`**, despite a committed
   `package-lock.json`. Lockfile drift will go unnoticed.
3. **`npm run lint:frontmatter` is declared but never called explicitly** in
   CI; it is picked up by `npm test`'s glob. The separate script is
   misleading.
4. **EXAMPLE.md (14 KB)** is not linked from README's docs list. Unclear
   whether it's aspirational or live.
5. **No `.nvmrc`, `.node-version`, or `engines` field** in `package.json`,
   though CONTRIBUTING.md says Node 20+. CI pins versions but contributors
   have no local signal.
6. **No Prettier or formatter config** — ESLint recommended rules only.
7. **`docs/audit-extensions.md`** is referenced by `/audit` and README but
   does not exist in this repo (expected — users create it).
8. **No CODEOWNERS, issue templates, or PR templates** despite being a
   collaborative framework repo.
9. **Pipeline stage gate JSON is produced by agents but not schema-validated
   on write**; `gate-validator.js` only checks `status`. Drift risk.
10. **Settings enables `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`** — a known
    experimental flag that may break on Claude Code version bumps.
