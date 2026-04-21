# Changelog

All notable changes to the `claude-dev-team` framework are recorded here. The
project follows [Semantic Versioning](https://semver.org/): major bumps for
breaking changes (pipeline shape, gate schema, agent catalogue, command
surface), minor bumps for additive features, patch bumps for fixes.

Until `v1.0.0`, the framework was tracked through `pipeline/context.md` fix-log
entries. From `v2.0.0` onward, this file is the authoritative changelog for
consumers.

## [Unreleased]

The `v2.x` line adds lightweight tracks, harder gate enforcement, expanded
brief/spec templates, and a deployment-adapter seam. Breaking changes are
called out per release below. Full upgrade path: `docs/migration/v1-to-v2.md`.

### Added — `v2.0.0` (in progress — tracks and routing)

- **Lightweight tracks.** New commands `/quick`, `/config-only`, `/dep-update`
  for changes that don't justify the full nine-stage pipeline. Each track has
  its own stage set documented in `.claude/commands/{track}.md`.
- **Scope-based routing in `/pipeline`.** When a feature request looks like
  a quick fix, the orchestrator now offers the appropriate lighter track
  before running the full pipeline. The user can still force full pipeline.
- **Safety stoplist.** Lighter tracks must not be used for auth, crypto, PII,
  payments, schema migrations, feature-flag introduction, or new external
  dependencies. The stoplist is enforced at routing time.
- **`track` field on every gate.** Gate files now include `"track":
  "<name>"` so downstream tooling can branch on track.

### Documentation

- `CHANGELOG.md` (this file) — new; versioned release notes.
- `docs/migration/v1-to-v2.md` — new; upgrade path for existing projects.
- `docs/tracks.md` — new; reference for the four tracks and how routing
  picks between them.

### Not yet in this release

The following planned items ship in later `v2.x` releases, as they break
orthogonal things and benefit from staged rollout:

- `v2.1` — Gate-validator hardening, approval integrity hook, src-edit
  detector for Stage 5 reviewers.
- `v2.2` — Expanded brief template (rollback, FF, migration, observability,
  SLO, cost). Expanded design-spec template. Stage 7 folded into Stage 6
  when every acceptance criterion maps 1:1 to a passing test.
- `v2.3` — Split `dev-qa` from `dev-platform`. Security Engineer agent
  with veto. Automated pre-review gate (Stage 4.5) for lint + SCA.
- `v2.4` — Deployment-adapter seam (`.claude/adapters/{docker-compose,k8s,
  terraform}/`). Runbook requirement on Stage 8.
- `v2.5` — Budget gate, cross-run meta-retro, lesson auto age-out, positive
  review channel (`PATTERN` tag), async-friendly checkpoints.

---

## Pre-v1 history (tracked in `pipeline/context.md`)

The fix-log in `pipeline/context.md` captured batches through the first four
rounds of improvements (2026-04-09, 2026-04-17). Those are preserved in
`pipeline/context.md` and will stay there for audit. New entries land in
this file from `v2.0.0` forward.
