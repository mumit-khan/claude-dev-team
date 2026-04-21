# Migrating from v1 to v2

`v2.x` introduces lightweight tracks, harder gate enforcement, expanded
brief and design-spec templates, and a deployment-adapter seam. This guide
walks an existing project through the upgrade in the order that minimises
breakage.

## Why upgrade

Under `v1`, every change — a typo, a config value tweak, a dependency bump
— ran the full nine-stage pipeline. The average run was 30–90 minutes and
spent most of that time in ceremony that routine changes didn't need.
`v2` keeps the full pipeline for feature-sized work and adds three
lighter tracks for everything smaller.

`v2` also closes a set of enforcement gaps the `v1` validator didn't catch:
the Stage 5 READ-ONLY reviewer rule, retry integrity, approval integrity,
and stale-escalation detection. Those land in `v2.1`; see the per-release
section below.

## Versioning and release shape

| Release | Scope | Breaking? |
|---|---|---|
| `v2.0.0` | Lightweight tracks + scope routing + `track` field on gates | Minor additive breaks only (see below) |
| `v2.1.0` | Gate-validator hardening + approval integrity + src-edit detector | Breaks gates that rely on loose validation |
| `v2.2.0` | Expanded brief/spec templates + Stage 7 folding + scoped peer review | Breaks brief/spec templates; peer review matrix shape |
| `v2.3.0` | `dev-qa` split from `dev-platform` + security-engineer agent + pre-review gate | Breaks agent catalogue and permissions |
| `v2.4.0` | Deployment-adapter seam + runbook requirement | Breaks Stage 8 default (docker-compose no longer assumed) |
| `v2.5.0` | Budget gate + cross-run retro + lesson age-out + `PATTERN` channel | Opt-in features, non-breaking |

Consumers can take releases individually. Each minor release has its own
migration steps at the bottom of this document.

## Before you start

Confirm the framework version the target project is on. From the target
project's root:

```bash
grep -E '^\s*##\s*\[' ../path-to-framework/CHANGELOG.md | head -5
```

If the target project doesn't track framework version explicitly, check the
`## Fix Log` in `pipeline/context.md` for the most recent batch.

Take a clean snapshot of `pipeline/` before upgrading — the preflight scan
(`v2.1`) flags things you'll want to diff against. Committing `pipeline/`
into git is not expected in every project, so either commit or stash it
somewhere outside the tree for the duration of the upgrade.

## `v2.0.0` — Tracks and routing

### What breaks

- The `/pipeline` command now asks about track choice when the request
  looks like a fit for `/quick`, `/config-only`, or `/dep-update`. If you
  have automation or scripts that pipe feature requests into Claude Code
  expecting zero prompts, they'll need an extra scripted response. The
  quickest mitigation is to prefix requests with `TRACK: full — ` which
  the orchestrator interprets as a hard-full directive.
- Gate files now contain a `"track"` field. Downstream tooling that
  parses gates with a strict schema (no extra fields) will fail. Relax
  the schema or add the field to your parser.
- The safety stoplist in `/pipeline` routing vetoes use of lighter tracks
  for auth/crypto/PII/payments/migrations/feature-flag/new-dep work. If
  you previously ran these as fast-tracked via an ad-hoc `/hotfix`, the
  `/hotfix` path still exists — the stoplist applies only to the three
  new lighter tracks.

### What doesn't break

- `/pipeline`, `/hotfix`, `/pipeline-brief`, `/pipeline-review`,
  `/retrospective`, `/reset`, `/resume`, `/stage`, `/status`,
  `/pipeline-context`, and all audit commands behave identically for
  feature-sized work.
- The 9-stage pipeline definition in `.claude/rules/pipeline.md` is
  additive: Stage 0 (routing) is new, but Stages 1–9 are unchanged.
- Agents are unchanged. PM, Principal, and the three devs keep their
  tool scopes, skills, and permissions.
- `pipeline/lessons-learned.md` format is unchanged.

### Steps

1. **Re-run bootstrap** against the target project. The three new command
   files (`quick.md`, `config-only.md`, `dep-update.md`) install under
   `.claude/commands/`. The updated `pipeline.md` command and
   `pipeline.md` rule file overwrite their predecessors.
2. **Read `docs/tracks.md`** to understand when each track fires.
3. **Decide a project policy** for which in-flight feature requests should
   route to `/quick` by default. The routing choice is interactive — the
   orchestrator asks, you answer — but you can set a house preference by
   adding a short rule to `CLAUDE.md`:

   ```markdown
   ## Pipeline routing preferences

   - Any request matching the pattern "docs:", "typo:", or "copy:" →
     default to `/quick` without prompting.
   - Any request matching "bump", "upgrade", "update <pkg>" → default to
     `/dep-update` without prompting.
   - Config-only requests named explicitly as such → `/config-only`.
   ```

   `CLAUDE.md` is yours and bootstrap never overwrites it, so the policy
   survives future framework updates.
4. **Update any external tooling** that parses `pipeline/gates/*.json` to
   ignore unknown fields (the `"track"` addition).
5. **Run one test pipeline** in each track to confirm your local shell,
   hooks, and agent catalogue all work. The lighter tracks are fast
   enough (~5–10 minutes each) that three dry runs is cheap insurance.

### Rollback

If `v2.0` breaks something in your environment: the three new track
commands are additive — you can `rm .claude/commands/{quick,config-only,
dep-update}.md` to disable them, and revert `.claude/commands/pipeline.md`
and `.claude/rules/pipeline.md` to their pre-`v2.0` state from git. The
`"track"` field on gate files is harmless if downstream tooling ignores
unknown fields.

## `v2.1.0` — Gate-validator hardening (forthcoming)

*Ships in a follow-up release.* Expected breakage: gates with malformed
`Reinforced:` lines in `lessons-learned.md`, Stage 5 gates whose named
approvers modified `src/` during the review invocation, retry gates with
empty `this_attempt_differs_by`. Full details plus a `npm run migrate:v2-1
--dry-run` preflight ship with that release.

## `v2.2.0` — Template expansion and Stage 7 folding (forthcoming)

*Ships in a follow-up release.* Breaks existing `pipeline/brief.md` and
`pipeline/design-spec.md` templates by requiring new sections. Stage 7
PM sign-off is folded into Stage 6 when every acceptance criterion maps
1:1 to a passing test; your automation should iterate gates rather than
assume a `stage-07.json` file exists for every run.

## `v2.3.0` — Agent catalogue expansion (forthcoming)

*Ships in a follow-up release.* Adds `dev-qa` as a distinct agent,
introduces a `security-engineer` agent with veto on security-relevant
changes, and adds a pre-review gate (4.5) for automated lint + SCA.

## `v2.4.0` — Deployment-adapter seam (forthcoming)

*Ships in a follow-up release.* Stage 8 stops assuming `docker-compose.yml`
exists. Projects declare their adapter (`docker-compose` | `k8s` |
`terraform` | `custom`) at bootstrap. A migration note will walk users
through adapter selection.

## `v2.5.0` — Learning loop and budget (forthcoming)

*Ships in a follow-up release.* Adds opt-in token/wall-clock budget gate,
cross-run meta-retro, lesson auto age-out, and a positive-signal
`PATTERN` review tag. All opt-in, non-breaking.

## Getting help

- Routing questions: `docs/tracks.md`
- Stage definitions: `.claude/rules/pipeline.md`
- Gate schema: `.claude/rules/gates.md`
- Known limitations and open issues: the `Unreleased` section of
  `CHANGELOG.md`
