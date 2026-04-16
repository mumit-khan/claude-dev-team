# 06 — Security Review

_Generated: 2026-04-16_

## Context

This repo is a **configuration-as-code framework**, not a running
application. It has no endpoints, no database, no user authentication,
no runtime. The security surface is:

1. **Bash installer** (`bootstrap.sh`, 167 LOC) that modifies a target
   project's filesystem.
2. **Node hook** (`.claude/hooks/gate-validator.js`, 89 LOC) that reads
   and parses JSON written by subagents.
3. **Presentation builder** (`docs/build-presentation.js`, 686 LOC) that
   pulls React/sharp/pptxgenjs via npm.
4. **Configuration files** (`.claude/settings.json`, `.claude/agents/*`,
   `.claude/commands/*`) that Claude Code loads to constrain agent
   behaviour.

Traditional web-app concerns (SQLi, XSS, CSRF, SSRF) do not apply
directly. They apply to *target* projects via the `security-checklist`
skill — that content is out of scope here.

## Threat model

Two realistic threat actors:

1. **A compromised or hallucinated subagent** writing malicious content
   to files it owns (`pipeline/gates/*.json`, `src/backend/**`). The
   hook and the orchestrator are the trust boundary.
2. **A malicious upstream dependency** (supply-chain attack via
   `pptxgenjs`, `sharp`, `react`, or any transitive dep). No production
   runtime, but the presentation build runs in contributor shells.

Out of scope: an attacker with write access to the repo; an attacker
with Claude Code API access; physical access to the maintainer's laptop.

## 1. Secrets hygiene

### Finding SEC-1 — no secrets in the tree — ✅ CLEAN

- Severity: none | Confidence: HIGH
- `grep -rni "api[_-]key\|password\|private[_-]key\|secret"` across
  all non-node-modules files returns only documentation strings
  (agent instructions like "don't log secrets") and one marketing line
  in `docs/build-presentation.js:398`. No hardcoded credentials.
- `.gitignore` excludes `.env`, `.env.local`, `.claude/settings.local.json`.
- `package-lock.json` is committed (supply-chain posture good).

### Finding SEC-2 — `.env` only gitignored at root — LOW

- Severity: Low | Confidence: HIGH
- `.gitignore` line 5 is `.env` / `.env.local`. Nested `.env` files
  (e.g., `src/backend/.env`) are NOT matched by this pattern. The
  `bootstrap.sh` installer does not add `**/.env` either.
- Realistic risk: a contributor to a target project places a `.env` in
  a service subdirectory and commits it.
- **Fix:** change to `**/.env` / `**/.env.local` in both the framework
  `.gitignore` and the `bootstrap.sh` appender.

## 2. Input handling

### Finding SEC-3 — gate-validator trusts gate-file content — LOW

- File: `.claude/hooks/gate-validator.js:39-83`
- Severity: Low | Confidence: MEDIUM
- Gate files are `JSON.parse`d, then string fields like `stage`, `agent`,
  `escalation_reason`, `decision_needed`, and `blockers[]` are
  interpolated into `console.log` output with no sanitisation. A gate
  file containing ANSI escape sequences, unicode control chars, or a
  very long string could affect terminal rendering for the human
  watching the pipeline.
- Trust model: gate files are written by Claude Code subagents, not
  external users. Treating this as an internal boundary is appropriate.
- **No fix required.** Worth one inline comment noting the trust model.

### Finding SEC-4 — bootstrap.sh `$TARGET` path handling — LOW

- File: `bootstrap.sh:24, 56-133`
- Severity: Low | Confidence: HIGH
- `TARGET="${1:-$(pwd)}"` is quoted in every use site (`"$TARGET"`),
  which handles spaces and most special chars. Line 40 validates the
  directory exists. `set -e` on line 21 fails fast on any command
  error.
- `rsync -a "$SCRIPT_DIR/.claude/" "$TARGET/.claude/"` with a trailing
  slash is the correct rsync idiom (copies contents, not the directory
  itself).
- No command injection path found — `$TARGET` never reaches a shell in
  eval form.
- **No action required.** Good.

### Finding SEC-5 — .gitignore appender is not idempotent per-line — LOW

- File: `bootstrap.sh:110-133`
- Severity: Low | Confidence: HIGH
- The appender checks whether `pipeline/gates/` is already present as a
  signal for "already configured", then appends 17 lines. If a
  contributor manually added `pipeline/gates/` but not the rest, a
  re-run skips the block entirely — some entries would be missing.
  Also: the block includes `.claude/settings.local.json` and
  `CLAUDE.local.md`, which `bootstrap.sh` correctly treats as preserved
  but the `.gitignore` rule to exclude them relies on this appender
  running at least once.
- **No exploitable security impact.** Filed as a correctness issue in
  `03-compliance.md` finding A3. Not elevated here.

## 3. Auth & authz (permission model)

### Finding SEC-6 — permission enforcement is Claude-Code-side — INFO

- Severity: Informational | Confidence: HIGH
- Agent file-scope restrictions ("dev-backend can only write to
  `src/backend/`") are declared in `.claude/agents/*.md` frontmatter
  and documented in prose. **The framework has no independent
  enforcement.** Claude Code is trusted to honour the scope.
- This is explicit and correct — the framework is a config layer. But
  it should be surfaced to evaluators: if Claude Code's scoping is
  bypassed (via a bug or a newer model that ignores the directive), the
  framework offers no second line of defence.
- **Documented in `README.md` "Known Limitations".** ✅

### Finding SEC-7 — `settings.json` allowlist is broad — LOW

- File: `.claude/settings.json:7-31`
- Severity: Low | Confidence: HIGH
- Notable allows:
  - `Bash(curl *)` — arbitrary HTTP, needed for deploy smoke tests
  - `Bash(git checkout *)` — can discard uncommitted work on any branch
  - `Bash(git worktree *)` — can create new worktrees anywhere
  - `Bash(docker compose *)` — broad Docker surface
  - `Write(src/**)`, `Write(pipeline/**)`, `Write(docs/**)`,
    `Write(.claude/agents/**)`, `Write(.claude/skills/**)` — broad
    filesystem writes
- Denies (tight):
  - `Bash(git push --force *)`
  - `Bash(rm -rf *)` — blocks the obvious footgun
  - `Bash(git push origin main *)` — prevents direct pushes to main
- Assessment: the deny list covers the hardest-to-reverse operations;
  the allow list is permissive but targeted at the framework's legitimate
  needs. Layered with per-agent frontmatter, the risk is acceptable.
- **Fix (optional, P3):** split `Write(src/**)` into
  `Write(src/backend/**)` / `Write(src/frontend/**)` /
  `Write(src/infra/**)` so an untrusted model that ignored agent-level
  scope is still blocked at the outer layer. Check that Claude Code
  supports this granularity.

### Finding SEC-8 — no deny rule for `Bash(rm *)` (broad form) — LOW

- File: `.claude/settings.json:33-37`
- Severity: Low | Confidence: MEDIUM
- The deny list blocks `Bash(rm -rf *)` but not `Bash(rm *)` or
  `Bash(rm -f *)`. A script invoking `rm -f somefile` is allowed; so is
  `rm file1 file2 …` which can reach arbitrary files.
- Realistic risk: low — subagents rarely run `rm` at all — but a small
  hardening opportunity.
- **Fix (P3):** add `Bash(rm -f *)` and `Bash(rm -r *)` to the deny
  list, or (better) require `Bash(rm *)` globally to prompt.

## 4. Dependency vulnerabilities

### Finding SEC-9 — `npm audit` is clean today — ✅

- Severity: none | Confidence: HIGH
- `npm audit --audit-level=low` reports **0 vulnerabilities** against
  the current `package-lock.json`. Dependencies:
  `@eslint/js`, `eslint`, `globals`, `pptxgenjs`, `react`, `react-dom`,
  `react-icons`, `sharp`.
- All declared with caret ranges (`^`), which is fine for devDeps of a
  framework project.

### Finding SEC-10 — no automated dependency update pipeline — MEDIUM

- Severity: Medium | Confidence: HIGH
- No Dependabot / Renovate / GitHub security-alerts config. The project
  has `package-lock.json` (good baseline) but no automated PR stream
  when a CVE drops. `sharp` in particular has a history of native-binding
  CVEs; `pptxgenjs` is less exposed but not immune.
- CI uses `npm install` (not `npm ci`), so a broken lockfile would be
  silently repaired rather than flagged — see finding A1 in
  `03-compliance.md`.
- **Fix (P1):** add `.github/dependabot.yml` with weekly `npm` updates
  grouped by dev-dep. 10 LOC of YAML.

### Finding SEC-11 — CI runs `npm install` not `npm ci` — LOW

- File: `.github/workflows/test.yml:25`
- Severity: Low | Confidence: HIGH
- `npm install` resolves the lockfile as "advisory"; a dep with a loose
  version in `package.json` could silently float during CI, even though
  the lockfile is committed.
- **Fix (P1):** replace `- run: npm install` with `- run: npm ci`. Same
  change in `CONTRIBUTING.md:15` optional.

## 5. Data exposure

### Finding SEC-12 — no PII surface — ✅

- Severity: none | Confidence: HIGH
- The repo contains no user data. Pipeline artifact templates
  (`pipeline/context.md` scaffold) are empty placeholders.
- Agent instructions explicitly warn against logging secrets
  (security-checklist skill).

### Finding SEC-13 — gate files are written to disk and tracked — INFO

- Severity: Informational | Confidence: HIGH
- When a target project runs `/pipeline`, `pipeline/gates/*.json` are
  gitignored by default (bootstrap installs the rule). They contain
  stage metadata — not secrets — but could in theory contain sensitive
  strings if an agent misbehaves (e.g., a `blockers[]` entry quoting an
  error message from an internal service).
- `.gitignore` coverage in the *framework* repo is correct. In target
  projects, relies on `bootstrap.sh:110-133` appender having run at
  least once — see SEC-5.
- **No action.** Worth documenting in `security-checklist/SKILL.md`.

## 6. Cryptography

### Finding SEC-14 — N/A — ✅

The framework performs no cryptographic operations. Nothing to review.
The `security-checklist` skill covers crypto concerns for target
projects.

## 7. Supply-chain & CI hygiene

### Finding SEC-15 — GitHub Actions pinned by major-version tag — LOW

- File: `.github/workflows/test.yml:17, 19`
- Severity: Low | Confidence: HIGH
- Uses `actions/checkout@v4` and `actions/setup-node@v4`, not pinned to
  SHAs. Supply-chain best practice is SHA-pinning so a compromised
  action release can't silently steal tokens.
- Trade-off: SHA-pinning makes Dependabot-driven action updates harder.
  For a framework repo with no production secrets in CI, tag-pinning is
  acceptable.
- **Fix (P3):** SHA-pin actions AND enable Dependabot for `github-actions`
  ecosystem so updates are still automated.

### Finding SEC-16 — `sudo apt-get install -y rsync` in CI — LOW

- File: `.github/workflows/test.yml:23`
- Severity: Low | Confidence: HIGH
- Installs `rsync` at every CI run. Ubuntu's apt repo is trusted, but
  this is a runtime dependency masquerading as a CI-only step —
  surfaces the same risk as finding A1 in `03-compliance.md` (bootstrap
  hard-fails without rsync).
- **Fix:** prefer a Bash-builtin `cp -rn` in bootstrap so rsync is no
  longer required. Larger change; already in the P1 backlog.

### Finding SEC-17 — no workflow file for `push` to feature branches — INFO

- File: `.github/workflows/test.yml:4-7`
- Severity: Informational | Confidence: HIGH
- CI runs on `push: branches: [main]` and `pull_request: branches:
  [main]`. Pushes to feature branches don't trigger CI until the PR is
  opened. Trade-off: less noisy, but a contributor can push a red branch
  and not see it until PR time.
- **No action needed** — design choice.

## Summary

| # | Finding | Severity | Confidence |
|---|---|---|---|
| SEC-1 | No secrets in tree | — | HIGH ✅ |
| SEC-2 | `.env` only gitignored at repo root | Low | HIGH |
| SEC-3 | Gate validator trusts file content (ANSI/control chars) | Low | MEDIUM |
| SEC-4 | bootstrap `$TARGET` handling | Low | HIGH (no issue) |
| SEC-5 | .gitignore appender not per-line idempotent | Low | HIGH |
| SEC-6 | Permission enforcement is Claude-Code-side | Info | HIGH |
| SEC-7 | settings.json allowlist is broad | Low | HIGH |
| SEC-8 | `Bash(rm -f *)` / `Bash(rm -r *)` not in deny list | Low | MEDIUM |
| SEC-9 | `npm audit` clean | — | HIGH ✅ |
| SEC-10 | No Dependabot / Renovate | Medium | HIGH |
| SEC-11 | CI uses `npm install` not `npm ci` | Low | HIGH |
| SEC-12 | No PII surface | — | HIGH ✅ |
| SEC-13 | Gate files may contain leaked strings | Info | HIGH |
| SEC-14 | No crypto surface | — | HIGH ✅ |
| SEC-15 | GitHub Actions pinned by tag not SHA | Low | HIGH |
| SEC-16 | `apt-get install rsync` in CI | Low | HIGH |
| SEC-17 | CI only on PR-to-main | Info | HIGH |

**Zero critical or high-severity findings.** One medium (SEC-10,
missing dependency automation). Remaining items are Low or Info.

The framework's security posture is appropriate for a configuration
layer. The two actionable items worth P1 backlog inclusion:
- **SEC-10** — add Dependabot (10 LOC, high value)
- **SEC-11** — switch CI to `npm ci` (1-line change)

Both are quick wins. Everything else is P2 or P3.
