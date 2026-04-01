# Claude Code Dev Team

A full simulated software development team running inside Claude Code.
Includes a PM, Principal Engineer, and three specialist developers with
peer code review, human checkpoints, deterministic gate validation, and
a hotfix path.

---

## Prerequisites

- Claude Code v2.1.32 or later (`claude --version`)
- Node.js (for the gate-validator hook)
- Git (worktrees used for parallel dev builds)

## First-time Setup

You can bootstrap a new project, or retrofit an existing one.

```bash
# 1. Create your project and unzip
mkdir /path/to/my-project && cd /path/to/my-project
git init
# The script is safe to run on an existing project — it uses
# cp -n (no-overwrite) for .claude/, backs up any existing
# CLAUDE.md to CLAUDE.md.bak, skips README.md if one exists, and
# won't touch your src/ if it's already there.
cd /path/to/dev-team && bash bootstrap.sh /path/to/my-project
cd /path/to/my-project

# 2. Customise for your stack (takes 5 minutes)
# Open .claude/skills/code-conventions/SKILL.md — change language/framework specifics
# Open .claude/skills/api-conventions/SKILL.md — adjust to match your API style
# Open .claude/agents/dev-platform.md — add your actual deploy command under "On a Deploy Task"

# 3. Start Claude and go!
claude
```

---

## Running the Pipeline

```bash
# Full feature pipeline
/pipeline Add a user authentication system with email + password login

# Draft brief only — review before committing to a full run
/pipeline-brief Add user authentication

# Check current pipeline state
/pipeline-status

# Re-run code review only (after manual fixes)
/pipeline-review

# Urgent production fix (skips design stage)
/hotfix Login endpoint returning 500 on valid credentials since deploy #142
```

---

## Human Checkpoints

The pipeline pauses three times for your review:

| Checkpoint | After Stage | You're reviewing |
|---|---|---|
| **A** | 1 — Requirements | PM's brief and acceptance criteria |
| **B** | 2 — Design | Principal's spec and architecture decisions |
| **C** | 6 — Tests | Test results vs acceptance criteria before deploy |

Type `proceed` to advance.

---

## Project Structure

```
your-project/
├── CLAUDE.md                          # Orchestrator (lean — reads rules/)
├── .claude/
│   ├── agents/
│   │   ├── pm.md                      # PM — requirements, sign-off
│   │   ├── principal.md               # Principal — architecture, reviews
│   │   ├── dev-backend.md             # Backend dev — APIs, services
│   │   ├── dev-frontend.md            # Frontend dev — UI, client
│   │   └── dev-platform.md            # Platform dev — tests, CI, deploy
│   ├── commands/
│   │   ├── pipeline.md                # /pipeline
│   │   ├── pipeline-brief.md          # /pipeline-brief
│   │   ├── pipeline-review.md         # /pipeline-review
│   │   ├── pipeline-status.md         # /pipeline-status
│   │   └── hotfix.md                  # /hotfix
│   ├── hooks/
│   │   └── gate-validator.js          # Deterministic gate checking
│   ├── rules/
│   │   ├── pipeline.md                # Stage-by-stage definition
│   │   ├── gates.md                   # Gate JSON schema
│   │   ├── escalation.md              # Escalation rules
│   │   └── compaction.md              # Context compaction instructions
│   ├── skills/
│   │   ├── code-conventions/SKILL.md  # Shared coding standards
│   │   ├── review-rubric/SKILL.md     # Code review checklist
│   │   ├── security-checklist/SKILL.md
│   │   └── api-conventions/SKILL.md
│   └── settings.json                  # Permissions, hooks, Agent Teams flag
├── pipeline/
│   ├── context.md                     # Shared memory (append-only)
│   ├── brief.md                       # PM output
│   ├── design-spec.md                 # Principal output
│   ├── design-review-notes.md         # Dev annotations
│   ├── adr/                           # Architecture Decision Records
│   ├── pr-{backend,frontend,platform}.md
│   ├── code-review/by-{backend,frontend,platform}.md
│   ├── test-report.md
│   ├── deploy-log.md
│   └── gates/                         # JSON gate files (machine-readable)
└── src/
    ├── backend/
    ├── frontend/
    └── infra/
```

---

## Agent Models

| Agent | Model | Why |
|---|---|---|
| PM | opus | Judgment: requirements, sign-off |
| Principal | opus | Judgment: architecture, rulings |
| dev-backend | sonnet | Execution: build, review |
| dev-frontend | sonnet | Execution: build, review |
| dev-platform | sonnet | Execution: test, deploy, review |

---

## How Gates Work

Every stage writes a JSON gate file to `pipeline/gates/`. The
`gate-validator.js` hook runs after every subagent stop and reads these
files — not prose. It exits with:

- `0` — PASS, continue
- `2` — FAIL, retry with owning agent
- `3` — ESCALATE, halt and surface to user

Your decision on any escalation is recorded in `pipeline/context.md`.

---

## Customising for Your Stack

1. Edit `.claude/skills/code-conventions/SKILL.md` for your language/framework
2. Edit `.claude/skills/api-conventions/SKILL.md` for your API patterns
3. Add deploy steps to `dev-platform.md` under "On a Deploy Task"
4. Add MCP servers to agent frontmatter (GitHub, Slack, Jira, etc.)
5. Swap `sonnet` → `haiku` on dev agents to reduce cost on simpler features

---

## Known Limitations

- **Agent Teams is experimental** (requires v2.1.32+). On failure, review
  falls back to sequential: each reviewer reads the others' output files.
- **Subagents cannot spawn subagents.** The main session invokes all agents.
- **Parallel builds use git worktrees.** Merge conflicts need manual resolution
  before Stage 5.
- **Token costs scale quickly.** Use `/pipeline-brief` before committing to a
  full run on a large feature.
