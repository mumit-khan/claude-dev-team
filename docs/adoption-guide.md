# Adoption Guide

For engineering managers and senior engineers making the case for claude-dev-team
inside their organisation — or evaluating it for the first time.

This document collects the questions teams actually ask, honest answers to each,
and the mistakes that slow adoption down. It is deliberately separate from the
user guide, which assumes you've already decided to use the tool.

---

## Questions & Answers

### On trust and code quality

---

**"AI-written code has bugs. Why would I ship this to production?"**

You wouldn't — not without reviewing it. The pipeline has three human checkpoints
where you read what was built and decide whether to continue. Nothing reaches
production without a human opening a pull request, reviewing the diff, and
merging it. The agents propose; you approve.

The more useful question is: does the code produced by the pipeline have *fewer*
bugs than code produced by a single developer working alone under time pressure?
In practice, it tends to — because Stage 5 (cross-area code review) is thorough
and the agents apply consistent principles on every change, not just when someone
has energy for a careful review.

---

**"What if the design is wrong? What if the Principal gets the architecture wrong?"**

At Checkpoint B, you review `pipeline/design-spec.md` before a single line of
code is written. You can push back, correct it, or reject it outright. The
Principal revises.

If a design decision turns out to be wrong after the fact, the ADR files in
`pipeline/adr/` record why the decision was made. That's the same paper trail
you'd want from a human architect — and it's more consistently produced.

---

**"What if the security review misses something?"**

It might. The security engineer agent is a heuristic-triggered review on known
sensitive surfaces — auth paths, crypto, PII, new dependencies, schema migrations.
It is not a penetration test and doesn't claim to be. You still need one.

What it catches reliably: obvious misconfigurations, missing guards on known
patterns (rate limiting, input validation, header stripping), dependency
vulnerabilities in the SCA scan, and IaC changes that widen attack surface.
That's the class of issue that most often survives code review because reviewers
are context-switching too fast to check every surface carefully.

If the security engineer issues a veto (`veto: true` in the gate), the pipeline
halts — no peer-review approval can override it. That's a hard stop, not a
warning.

---

**"What does it mean that the Principal makes 'binding rulings'? The AI is making
architectural decisions for my team?"**

The Principal makes binding rulings when two reviewer agents disagree and can't
resolve it after two rounds. In practice, that's a rare path — the review round
limit and escalation exist for the edge case, not the common case.

The Principal's ruling is binding *within the pipeline* for that run. You still
read the design spec at Checkpoint B and the ruling is recorded in `pipeline/context.md`.
If you disagree with it, you can reject it at the next checkpoint, edit the spec,
and proceed differently. The pipeline doesn't have authority over your codebase —
it has authority over its own execution.

---

**"What happens when agents disagree with each other?"**

That's the system working as intended. Stage 5 has explicit conflict resolution:
two rounds of CHANGES REQUESTED → fix, and if still unresolved, the Principal
makes a ruling. If the ruling doesn't resolve it, the pipeline FAILs explicitly
rather than silently proceeding with unresolved disagreement.

A pipeline that surfaces a genuine design conflict between "backend" and "platform"
concerns is doing useful work — that conflict existed in the spec; the pipeline
just found it before the code shipped.

---

### On process and existing workflow

---

**"This adds ceremony. We're a fast-moving team."**

The full `/pipeline` command is 30–90 minutes. `/quick` is 5–10 minutes. `/nano`
is 1–3 minutes. The ceremony is proportional to the change.

The question is where the ceremony goes, not whether it exists. A feature without
a design review, a code review, and a test pass isn't fast — it's deferred work
that surfaces at 2am when something is broken in production. The pipeline front-loads
that work and makes it happen automatically rather than requiring developers to
remember to do it.

Teams that find the pipeline slow are often running `/pipeline` on changes that
belong in `/quick`. The track selection decision tree in the user guide covers this.

---

**"We already have a good PR review process."**

Then Stage 5 makes your PR review lighter, not redundant. The agent reviewers
catch structural issues — missing guards, bad assumptions, violated conventions —
before human reviewers spend time on them. By the time your team opens the PR,
the obvious stuff is already handled.

The two reviews are not the same thing. Agent review checks for convention
compliance, spec adherence, and cross-area consistency. Human review brings
domain knowledge, product context, and relationship to the team's actual goals.
Both have a role.

---

**"How does this fit with our sprint process? Does it replace tickets?"**

It doesn't replace tickets. The typical integration is:

1. Ticket exists in Jira / Linear with a description
2. Engineer (or manager) runs `/pipeline <feature description>`
3. PM agent writes the brief — you review and correct it against the ticket
4. Pipeline runs
5. PR is opened; linked to the ticket
6. Ticket is closed after merge

The pipeline's brief becomes the functional spec that was often missing from
the ticket. Some teams find this actually helps their sprint planning — the
brief surfaces scope questions before estimates are made, not after code is
written.

---

**"What about our coding conventions? Will the agents follow our standards?"**

The framework loads your coding conventions through a skill at the start of each
build task. Edit `.claude/skills/code-conventions/` to reflect your team's
standards: naming conventions, error handling patterns, file structure, preferred
libraries. Agents follow what's written there.

If the agents violate a convention the skill didn't capture, the Stage 5 reviewer
will catch it — or you will at a checkpoint. Add it to the skill so it's caught
automatically next time.

---

**"Does this replace our CI/CD?"**

No. The pipeline runs lint, type-checking, and tests internally (Stages 4.5a and 6),
but these are pre-PR checks — not your production CI. GitHub Actions (or Jenkins,
or whatever you use) still runs on the PR as usual. The pipeline is a pre-PR
production layer, not a CI replacement.

Deploy at Stage 8 targets dev or staging environments via the configured adapter.
Production deployment is still your process, your gates.

---

### On team dynamics

---

**"Will this make developers lazy or deskill them?"**

The risk is real if developers treat the pipeline as a black box and stop reading
what it produces. The checkpoints exist precisely to prevent that — you're required
to read the brief, the design, and the test results before proceeding.

The work that the pipeline automates is largely the *overhead* of development:
writing boilerplate, running lint, checking every file for a missed validation.
The judgment work — whether the design is right, whether the acceptance criteria
match the actual user need, whether the test coverage is sufficient — still
requires a developer who knows the domain.

Teams that use the pipeline well tend to get better at reading specs and design
documents, because those documents now exist for every feature and must be approved
before build begins.

---

**"Does this mean we need fewer developers?"**

That's a question about your team's priorities, not about the tool. The pipeline
doesn't remove the need for engineers who understand the system, make architectural
decisions, and review what was built. It removes the need for engineers to spend
time on the mechanical parts of those activities.

What teams typically find: the same number of engineers can handle more features
per cycle, or the same number of features with substantially fewer post-ship bugs.
Neither outcome requires a headcount conversation.

---

**"What if a developer on my team doesn't trust the pipeline output and wants to
rewrite what was generated?"**

That's their call — they own the code. The pipeline produces a PR from a worktree;
if an engineer wants to open the files and rewrite them, nothing stops that. The
gate files record what the pipeline produced; the git diff records what was
actually merged.

What you want to avoid is developers silently ignoring the pipeline's output and
then running `/pipeline` again on the same feature, producing a second conflicting
set of artefacts. If there's disagreement with what was built, the better path is
to raise it at a checkpoint, push back on the design spec, or open a `CONCERN:`
in `pipeline/context.md` — which routes to the Principal for a ruling.

---

### On safety and security of the tool itself

---

**"Can the AI see our proprietary code?"**

Yes — Claude Code reads your local filesystem. That's how it works: the agents
read source files to write code, run reviews, and write tests. The same privacy
considerations apply here as to any AI coding tool your team already uses (GitHub
Copilot, Cursor, etc.).

If you're using the TELUS Fuelix proxy or a private API endpoint configured in
`settings.json`, your code is sent to that endpoint, not directly to Anthropic.
Check your organisation's AI usage policy and configure `ANTHROPIC_BASE_URL`
accordingly.

---

**"What can it do without our approval?"**

Read and write files under `src/`, `pipeline/`, and `docs/`. Run lint and test
commands. Create git worktrees (local only — no remote operations). Follow the
deploy adapter instructions to deploy to a configured dev/staging environment.

It cannot commit, push, open a PR, send messages to external services, or access
cloud consoles unless you've explicitly configured MCP server integrations in
`.claude/settings.json` with those capabilities.

---

**"What if it makes a destructive change — deletes files, breaks the database?"**

The agents are scoped by area: `dev-backend` can only write to `src/backend/`,
`dev-frontend` to `src/frontend/`, etc. Cross-area edits require a `CONCERN:`
line routed through the orchestrator first.

The deploy stage never auto-rollbacks — if a deploy fails, the pipeline surfaces
the runbook's `## Rollback` section and waits for a human decision. Destructive
database operations (schema migrations, data deletions) trigger the security
review heuristic at Stage 4.5b and require the full `/pipeline` track, not a
lighter one.

Nothing in the pipeline runs `git push`, drops tables, or deletes files from
`src/` as part of normal operation. If you see a command that looks destructive,
you can deny it — Claude Code prompts for permission on operations outside the
configured allowlist.

---

## What Not to Do

These are the adoption mistakes that come up most often.

---

**Don't start with a high-stakes feature.**

The first pipeline run on a team always reveals mismatches between the framework's
defaults and the project's actual structure — wrong file paths, missing adapter
config, coding conventions the skill doesn't capture. You want to discover and fix
those mismatches on something boring, not on the feature that's due before a
client demo.

Start with something self-contained and non-critical: a health check endpoint,
a utility function, a documentation page. The pipeline produces exactly the same
artefacts for a boring feature as for a critical one — you get the full learning
experience with zero risk.

---

**Don't run it solo and present the results.**

"I ran it and it worked" is a claim. "Watch it run" is a demonstration. There's
a meaningful difference in how teams respond.

When a skeptic watches the Stage 5 reviewer catch a bug — and then watches the
backend dev fix it in the next invocation — they've seen the system work. That's
worth more than any amount of explaining, because they've directly observed
something they thought couldn't work actually working.

Run the first team demo live, with someone skeptical in the room.

---

**Don't try to run `/pipeline` on everything immediately.**

The `/pipeline` track is 30–90 minutes. If a team adopts it for every change —
including typos, config tweaks, and single-line fixes — they'll correctly identify
it as slow and abandon it. The track system exists for a reason.

Spend the first week identifying which changes in your backlog actually belong in
each track. For most teams: the majority of day-to-day changes fit `/quick` or
`/nano`; the full pipeline is for feature-sized work.

---

**Don't ignore the retrospective.**

The retrospective runs automatically after every deploy. Most teams read the
synthesis block once and then start running the next pipeline. That's fine for
the first few runs, but after 5–10 runs, `pipeline/lessons-learned.md` starts to
carry real institutional knowledge — specific to your codebase, your conventions,
and the mistakes your team has actually made.

Treat `lessons-learned.md` as a living document. Read it in team meetings. If a
lesson is wrong, flag it so the next retro can retire it. If a lesson is missing,
add a `CONCERN:` at the end of the next run's retro section.

---

**Don't edit `pipeline/retrospective.md` to remove uncomfortable findings.**

The retrospective is the team's honest record of what went wrong. If the PM brief
was ambiguous, if a reviewer missed something that a dev's tests caught, if the
pipeline had to escalate because the spec and the implementation disagreed — all of
that should stay.

The purpose of the retro is to catch patterns *before* they become recurring
problems. Sanitising the record defeats that purpose. If a finding is factually
wrong (the agent misread something), correct it with a note explaining why. Don't
delete it.

---

**Don't set aggressive checkpoint auto-pass conditions early.**

The opt-in `auto_pass_when` config is useful for teams that have run the pipeline
many times and trust the output of specific stages. For new adopters, the
checkpoints are where you build that trust. Auto-passing Checkpoint A before
you've read ten briefs produced by the PM agent means you're skipping the main
mechanism for course-correcting the pipeline to your project.

Keep checkpoints manual for the first month. Add auto-pass conditions only after
you've seen the pipeline produce consistently correct output at the stage you're
considering automating.

---

## What Good Adoption Looks Like in Practice

A rough timeline for a team of 4–8 engineers:

| Week | Activity | Goal |
|---|---|---|
| 1 | `/audit-quick` → share output with team | Build shared vocabulary around the codebase |
| 1–2 | Full `/audit` → review roadmap together | Prioritise findings; demonstrate value |
| 2–3 | First `/pipeline` run on a low-risk feature, live demo | Show the pipeline working end-to-end |
| 3–4 | Two or three `/quick` runs on backlog items | Calibrate track selection to your project |
| 4–6 | First `/pipeline` run on a real feature | Validate that the output meets your standards |
| 6+ | Pipeline runs as standard for feature work; lighter tracks for maintenance | Normal workflow |

The most reliable signal that adoption is working: the team stops saying "let me
check what the pipeline produced" and starts saying "where's the brief?" before
any significant change begins.
