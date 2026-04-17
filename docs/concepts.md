# Concepts

A glossary of the terms used throughout this framework. Read this once if
you're new to Claude Code or to this repo — every command, skill, and rule
below is built on these primitives.

## Agent

A named role (e.g. `pm`, `principal`, `dev-backend`) defined by a markdown
file under `.claude/agents/`. Each agent has YAML frontmatter declaring its
model (`opus` or `sonnet`), its tool allowlist, its permission mode, and
any skills it should load at spawn. The main Claude Code session invokes
agents via the Task tool; each agent runs in its own context and returns
a single message. Agents do not call other agents.

## Command

A slash command (e.g. `/pipeline`, `/audit`, `/status`) defined by a
markdown file under `.claude/commands/`. Commands are thin instruction
sheets: they tell the main session which rules to load, which agents to
invoke, and in what order. Running a command does not spawn a new
process — it injects a prompt into the current session.

## Skill

A reusable prompt fragment packaged as a folder under `.claude/skills/`
with a `SKILL.md` file. Skills fall into two categories:
- **User-invocable skills** (e.g. `implement`, `pre-pr-review`) have
  YAML frontmatter so Claude Code lists them for direct invocation.
- **Context-loaded skills** (e.g. `code-conventions`, `security-checklist`)
  have no frontmatter and are loaded by agents via the `skills:` key in
  their frontmatter.

## Rule

A file under `.claude/rules/` loaded automatically by the main session
at startup. Rules are persistent — they apply to every interaction in
the session, not just to a specific command. `orchestrator.md`,
`pipeline.md`, `gates.md`, `escalation.md`, and `compaction.md` are the
five rule files this framework ships.

## Hook

A shell command configured in `.claude/settings.json` that runs in
response to a Claude Code event (e.g. `Stop`, `SubagentStop`,
`PostToolUse`). Hooks are executed by the Claude Code harness, not by
Claude itself. This framework wires a single hook — `gate-validator.js` —
to `Stop` and `SubagentStop` so every agent's final gate file is
validated before the orchestrator proceeds.

## Gate

A small JSON file written to `pipeline/gates/` at the end of each
pipeline stage. Every gate has `stage`, `status` (`PASS` / `FAIL` /
`ESCALATE`), `agent`, `timestamp`, `blockers`, and `warnings` fields.
The orchestrator reads gate JSON, not prose — this makes the stage
transitions deterministic and machine-checkable. The full schema is in
`.claude/rules/gates.md`.

## Pipeline Stage

One of the eight numbered steps in `/pipeline`: Requirements, Design,
Clarification, Build, Peer Review, Test, PM Sign-off, Deploy. Each stage
has an owning agent (or agents for parallel steps), reads specific
inputs, writes a specific gate file, and must pass its gate before the
next stage starts. Stages 4 and 5 run three agents in parallel via git
worktrees.

## ADR (Architecture Decision Record)

A short markdown file under `pipeline/adr/` that records a significant
technical decision made during Stage 2 (Design) — the context, the
decision, the alternatives considered, and the rationale. Written by
the Principal agent. Indexed in `pipeline/adr/index.md`. The `/adr`
command writes one outside a pipeline run.

## Checkpoint

A human-review pause point in a command. The pipeline has three:
Checkpoint A (after Stage 1), Checkpoint B (after Stage 2), and
Checkpoint C (after Stage 6). Audits have three (after Phases 0, 1,
and 2). The session prints a summary and waits for `proceed` before
continuing. Checkpoints are where humans verify the work and correct
course — not where the machine decides to halt.

## Escalation

When an agent cannot proceed without a human decision, it writes
`"status": "ESCALATE"` to its gate file with an `escalation_reason` and
`decision_needed`. The `gate-validator.js` hook exits with status 3,
which signals the orchestrator to halt and surface the decision to the
user. Full protocol in `.claude/rules/escalation.md`.
