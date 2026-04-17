# Contributing

## Prerequisites

- Node.js 20+
- Git
- rsync (for bootstrap.sh)
- [Claude Code](https://claude.ai/code) (to run the agent team)

## Setup

```bash
git clone https://github.com/mumit/claude-dev-team.git
cd claude-dev-team
npm install
```

## Running Tests

```bash
npm test                    # unit tests (gate-validator, etc.)
npm run test:integration    # integration tests (bootstrap.sh)
npm run test:frontmatter    # YAML frontmatter schema tests for agents/skills
```

All tests use Node's built-in `node:test` runner — no external test framework needed.

> Note: `npm run lint:frontmatter` is a historical alias for `test:frontmatter` —
> both run the same frontmatter schema test file. The `lint:` prefix predates
> the test-runner rename; prefer `test:frontmatter` in new docs.

## Project Structure

This is a **framework/template**, not an application. There is no `src/` directory in the repo itself — `src/` is created by `bootstrap.sh` when installing into a target project.

The key components:

| Path | Purpose |
|------|---------|
| `.claude/agents/` | Agent definitions (PM, Principal, 3 devs) |
| `.claude/commands/` | Slash commands (`/pipeline`, `/status`, etc.) |
| `.claude/skills/` | Shared skill definitions (conventions, checklists) |
| `.claude/rules/` | Pipeline rules, gate schema, escalation, orchestrator |
| `.claude/hooks/` | Git/tool hooks (gate-validator.js) |
| `pipeline/` | Runtime pipeline state (gates, context, artifacts) |
| `bootstrap.sh` | Installs the framework into an existing project |

See `AGENTS.md` for the full team and command reference.

## Making Changes

1. Make your changes on a feature branch
2. Run `npm test` to verify existing tests pass
3. Add tests for new functionality in `tests/`
4. Open a PR against `main`

## Testing Conventions

- Tests live in `tests/` with the naming pattern `*.test.js`
- Use `node:test` (`describe`, `it`) and `node:assert/strict`
- No external test dependencies
- For hooks and scripts, spawn them as child processes and assert on exit codes and stdout

## Bootstrap Script

`bootstrap.sh` copies the framework into an existing project. If you modify it:

- Test with `npm run test:integration`
- Verify it runs on both macOS and Linux (CI covers both)
- It must be idempotent — running twice should not break anything
- `.claude/` is overwritten on every run (framework-owned)
- `CLAUDE.md` is created only if missing (project-owned)
- `*.local.*` files and `settings.local.json` are always preserved

## Adding a New Command, Skill, or Agent

The framework is extensible via three primitive types — see
[`docs/concepts.md`](docs/concepts.md) for definitions. All three live
under `.claude/` and are validated by `npm run test:frontmatter`.

### Adding a command

1. Create `.claude/commands/my-command.md`.
2. Frontmatter is optional for commands. If omitted, the file is loaded
   as a plain prompt when the user types `/my-command`.
3. Write prose instructing the main session what to do — which rules to
   load, which agents to invoke, which files to read/write. Keep it
   declarative; commands should not contain code.
4. Update the "When to Use What" table in `README.md`.

Minimal example:
```markdown
# /my-command

Read `.claude/rules/pipeline.md`, then invoke the `pm` agent with the
following prompt: "Summarise pipeline/brief.md in 3 bullet points."
```

### Adding a skill

1. Create `.claude/skills/my-skill/SKILL.md`.
2. If the skill is user-invocable (shows up in `/`-autocomplete), add
   frontmatter with `name` and `description`:
   ```yaml
   ---
   name: my-skill
   description: One-line explanation shown in the picker.
   ---
   ```
   If the skill is context-loaded by an agent, omit the frontmatter.
3. Write the skill body as a prompt fragment. It will be injected into
   the caller's context at invocation.
4. If context-loaded, add the skill name to the `skills:` key in the
   agent's frontmatter (e.g. `.claude/agents/dev-backend.md`).
5. `npm run test:frontmatter` validates the schema for skills that have
   frontmatter.

### Adding an agent

1. Create `.claude/agents/my-agent.md`.
2. Frontmatter is required. Minimum keys:
   ```yaml
   ---
   name: my-agent
   description: What this agent does in one line.
   tools: [Read, Write, Glob]
   model: sonnet
   permissionMode: default
   ---
   ```
   The `name` field **must match the filename** (minus `.md`).
3. Write the agent's system prompt as the file body. Describe its role,
   the files it owns, the files it may read, the outputs it writes, and
   any gates it must honour.
4. If other agents should invoke this one, update
   `.claude/rules/orchestrator.md` and the relevant command definitions.
5. Run `npm run test:frontmatter` — it will fail if required keys are
   missing or if `name` does not match the filename.
