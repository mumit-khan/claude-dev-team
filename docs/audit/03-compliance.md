# 03 — Convention Compliance

_Generated: 2026-04-16_

## Methodology

This repo documents conventions in four places:

1. `.claude/skills/code-conventions/SKILL.md` — general code standards.
2. `.claude/skills/api-conventions/SKILL.md` — REST patterns.
3. `.claude/rules/gates.md` + `pipeline.md` — gate JSON schema + stage flow.
4. `CONTRIBUTING.md` — testing conventions.

Because this is a framework, many code-level conventions (SQL,
parameterised queries, HTTP status codes) apply to *target* projects, not
to this repo. The audit focuses on:

- Conventions that do apply to the framework itself.
- Internal consistency across `.claude/agents/**`, `.claude/commands/**`,
  `.claude/rules/**`, and user-facing docs.
- Drift between what the framework preaches and what it practices.

Findings are grouped by category. Each carries a **confidence** grade.

---

## A. Naming

### A1. Filename casing — HIGH

- **Convention (`code-conventions/SKILL.md:17`):** "Files: `kebab-case` for
  all languages."
- **Observed:** All `.md` files under `.claude/` follow kebab-case.
  Exceptions:
  - `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `EXAMPLE.md`, `README.md`
    — **justifiable**: these are ecosystem conventions (the node/GitHub
    world expects ALL-CAPS root docs).
  - `SKILL.md` (inside each `skills/*/` directory) — **justifiable**:
    consumed by Claude Code's skill loader which expects this literal name.
- **Verdict:** Compliant.

### A2. Commit message style — HIGH

- **Convention (`code-conventions/SKILL.md:42`):** "Commit messages:
  imperative mood, 72-char subject line."
- **Observed (39-commit history):** Consistent `type(scope)?: subject`
  style. A few subject lines exceed 72 chars:
  - `5184fa7 refactor: split build-presentation.js into per-slide functions` — 67 chars, OK.
  - `a9addea feat: rename pipeline-status to pipeline-context and manage context.md in reset` — **90 chars, over**.
  - `bc962c8 feat: add audit workflow, implement/review skills, and lifecycle docs` — **77 chars, over**.
  - `5d77fc9 feat: add CONTRIBUTING.md with setup, testing, and project structure guide` — **83 chars, over**.
- **Suggested fix:** LOW value; no enforcement tooling in place. Consider
  adding a commit-message hook or just accepting drift — this is not
  load-bearing.
- **Confidence:** HIGH.

### A3. Command filename ↔ description drift — MEDIUM

- **Observed:** `/.claude/commands/pipeline-context.md` describes itself as
  a "context dump before /compact" but the description verb is "Produce
  a concise context dump of the current pipeline state." Meanwhile
  `.claude/commands/status.md` prints a status dashboard. `pipeline-context`
  was previously `pipeline-status` and was renamed in Batch 3 of the prior
  roadmap. The rename is clean — no stale references remain in
  `.claude/commands/`, the README, or AGENTS.md (verified via
  `grep pipeline-status`). All remaining mentions are in the audit output
  itself (expected history).
- **Verdict:** Resolved.
- **Confidence:** HIGH.

---

## B. Code style (JavaScript)

### B1. String quote inconsistency — HIGH

- **Observed:**
  - `tests/bootstrap.test.js`, `tests/frontmatter.test.js`, `tests/smoke-presentation.test.js` → **single quotes**.
  - `tests/gate-validator.test.js`, `.claude/hooks/gate-validator.js`,
    `docs/build-presentation.js`, `eslint.config.js` → **double quotes**.
- **Severity:** cosmetic; no Prettier config to normalize.
- **Suggested fix:** Adopt one (recommend double quotes — dominant 4-of-7
  files and consistent with JSON) via Prettier or ESLint `quotes` rule.
- **Confidence:** HIGH.

### B2. No JSDoc on exported/public functions — MEDIUM

- **Convention (`code-conventions/SKILL.md:9`):** "Every public
  function/method has a docstring or JSDoc comment."
- **Observed:**
  - `.claude/hooks/gate-validator.js` — header comment only; no function
    docstrings (it's script-style, no exports). Acceptable.
  - `docs/build-presentation.js` — per-slide functions have `/** … */`
    one-liners (added in the Batch 4 refactor). Module-top helpers
    (`renderIconSvg`, `icon`, `addCard`, `sectionSlide`) also documented.
    Compliant.
  - `eslint.config.js` — trivial config; no doc needed.
- **Verdict:** JS files that exist are adequately commented for their
  complexity.

### B3. Magic numbers — LOW

- **Convention:** "No magic numbers — use named constants."
- **Observed:** `docs/build-presentation.js` contains many literal
  coordinates/sizes (`0.62`, `4.1`, `1.55`, `0.82`, etc.). These are
  **slide-layout numbers** — intentional because each slide has bespoke
  geometry. Naming them per slide would be worse, not better.
- **Verdict:** **Possibly intentional.** Flagged as a known trade-off in
  the Batch 4 refactor note. Accept.

### B4. Error handling in `gate-validator.js` — HIGH

- **Observed:** `gate-validator.js:41–44` prints `"ERROR: Could not parse
  … Gate files must be valid JSON"` and exits 1. Errors surface via
  `console.error` on stderr. Paths to invalid files are printed by name
  only (no full absolute paths, which is good — no internal path leak).
- **Verdict:** Compliant with `code-conventions/SKILL.md:26` ("Errors
  surfaced to users must never expose stack traces or internal paths").

### B5. `npm run lint:frontmatter` is dead code — MEDIUM

- **Observed:** `package.json:10` declares
  `"lint:frontmatter": "node --test tests/frontmatter.test.js"`.
  CI does not call it (`.github/workflows/test.yml:27–29` runs `npm run
  lint` and `npm test`). `npm test` globs `tests/**/*.test.js` and picks
  up `frontmatter.test.js`, so coverage is fine — but the script is
  unreferenced.
- **Suggested fix:** Delete the `lint:frontmatter` script or invoke it
  explicitly in CI as a guard. Silent-dead-scripts trap contributors into
  thinking there is a dedicated pre-commit lint path.
- **Confidence:** HIGH.

---

## C. Bootstrap installer

### C1. `rsync` is a hard dependency — HIGH

- **Observed (`bootstrap.sh:37`):** bootstrap exits 1 if `rsync` is not
  on `$PATH`. CI installs it (`.github/workflows/test.yml:23`). Our test
  sandbox does **not** have rsync, causing 17-of-18 bootstrap tests to
  fail locally.
- **Convention-level issue:** the framework commits to being runnable on
  macOS + Linux (CONTRIBUTING.md:63) but uses a tool absent from many
  minimal Linux images (Alpine, Docker slim, CI sandboxes).
- **Suggested fix:** Either (a) keep rsync but document the install line
  in CONTRIBUTING.md, or (b) fall back to `cp -R` + explicit exclude loop
  when rsync is missing. `cp` is POSIX; rsync is nicer for `--exclude`
  patterns.
- **Confidence:** HIGH.

### C2. AGENTS.md "create-if-missing" comment is misleading — HIGH

- **Observed:** `bootstrap.sh:73–79` branches on `-f $TARGET/AGENTS.md`
  but both branches call `cp "$SCRIPT_DIR/AGENTS.md" "$TARGET/AGENTS.md"`.
  Only the log line differs ("Created" vs "Updated").
- **Actual behaviour:** AGENTS.md is framework-owned and overwritten on
  every run — consistent with the README's ownership table (AGENTS.md
  listed as framework-owned).
- **Verdict:** Code comment/structure implies conditional copy but logic
  copies unconditionally. Cosmetic but confusing.
- **Suggested fix:** Collapse the branches to a single `cp` and a single
  log line: "📄 Updated AGENTS.md".
- **Confidence:** HIGH.

### C3. `src/` bootstrap contradicts README — MEDIUM

- **Observed:** `bootstrap.sh:96–103` creates `src/backend`, `src/frontend`,
  `src/infra` when `$TARGET/src` does not exist. CONTRIBUTING.md:28–30
  says the framework repo has no `src/` (correct — this repo ships none).
  Target projects that don't use a `src/` layout (e.g., Go's `cmd/` +
  `internal/`, Rust's `src/main.rs`) get framework-specific directories
  they didn't ask for.
- **Suggested fix:** Make `src/` creation opt-in via a flag, or at least
  log a clearer warning. Low priority — currently harmless but opinionated.
- **Confidence:** MEDIUM.

---

## D. Agent/skill frontmatter

### D1. Skills array on agents — HIGH

- **Convention:** agent frontmatter should declare its skills.
- **Observed:**
  - `pm.md` — **no `skills:` key**. PM doesn't need
    code/api/security/review skills.
  - `principal.md` — `skills: [security-checklist, api-conventions]`.
  - `dev-backend.md` — `[code-conventions, api-conventions,
    security-checklist, review-rubric]`.
  - `dev-frontend.md` — `[code-conventions, security-checklist,
    review-rubric]` (no api-conventions, sensibly).
  - `dev-platform.md` — `[code-conventions, security-checklist,
    review-rubric]` (no api-conventions).
- **Verdict:** Compliant; `implement/SKILL.md` and `pre-pr-review/SKILL.md`
  are not registered on agents because they are triggered by user phrases
  via the Skill loader rather than being loaded on agent spawn.

### D2. PostToolUse hook only on two agents — MEDIUM

- **Observed:** `dev-backend` and `dev-frontend` have a PostToolUse hook
  that pipes `npm run lint` into `pipeline/lint-output.txt` after every
  Write/Edit. `dev-platform` has the identical hook. `principal` and `pm`
  do not — they use Write/Edit too (PM writes `brief.md`, Principal
  writes `design-spec.md` and ADRs), but those are markdown artifacts
  that wouldn't be linted by `npm run lint`.
- **Verdict:** Reasonable as-is. Worth documenting in the agent template
  so future agent authors know the pattern.
- **Confidence:** MEDIUM.

### D3. Experimental env flag on every run — MEDIUM

- **Observed:** `.claude/settings.json:3` sets
  `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. This is required for the
  parallel-agent code-review feature that underpins Stage 5. It is
  explicitly flagged as experimental in the README ("Known Limitations"),
  but there is no runtime check: if Claude Code drops or renames the
  flag, gate behaviour changes silently.
- **Suggested fix:** Parked; depends on Claude Code team decisions.
- **Confidence:** HIGH.

---

## E. Documentation consistency

### E1. CLAUDE.md is an empty placeholder — HIGH

- **Observed:** The shipped `CLAUDE.md` is a three-line comment block. The
  orchestrator logic lives in `.claude/rules/orchestrator.md`, which the
  command files read explicitly. This is by design (CLAUDE.md is
  user-owned; bootstrap never touches it after first create).
- **Tension:** README and `pipeline.md` reference `CLAUDE.md` as the
  loaded orchestrator. The empty placeholder provides no content to
  Claude Code by default. Anyone using this framework standalone must
  either add content or rely purely on `.claude/rules/`.
- **Suggested fix:** Make the placeholder include at minimum a `@include`
  or a line pointing at `.claude/rules/orchestrator.md`, or document in
  the README that the orchestrator rules load automatically regardless of
  CLAUDE.md state.
- **Confidence:** HIGH.

### E2. Duplicate team definitions — MEDIUM

- **Observed:** The 5-agent team is defined in:
  - `.claude/agents/*.md` (authoritative — the Claude-Code-loaded
    definitions).
  - `AGENTS.md` (human-readable shim for other tools).
  - `.claude/rules/orchestrator.md` (five bullets naming the team).
  - `README.md` (agent models table).
- All four agree on roles and models today. Any future agent addition
  needs to update **four** places; no test enforces sync.
- **Suggested fix:** Add a test that parses `.claude/agents/*.md` and
  asserts the agent list in `AGENTS.md` and `README.md` matches.
- **Confidence:** MEDIUM.

### E3. ESLint config ignores only `node_modules/` — MEDIUM

- **Observed:** `eslint.config.js:4–6` ignores `node_modules/**` only.
  `pipeline/` can contain generated markdown with code fences (including
  JS snippets) when a pipeline is active. ESLint won't try to lint `.md`
  files (no glob match), so this is currently a non-issue. Remains a
  potential trap if `.mdx` is ever added.
- **Verdict:** Low risk; mention in `05-documentation.md` as a doc-gap
  if `pipeline/` handling ever changes.

---

## F. Testing conventions

### F1. Test file location — HIGH

- **Convention (`code-conventions/SKILL.md:36`):** "Test file lives next
  to the source file it tests: `foo.ts` → `foo.test.ts`."
- **Observed:** All tests live under `tests/`, not co-located. There are
  no co-located `.test.js` files anywhere.
- **Tension:** The convention explicitly allows either; CONTRIBUTING.md:52
  says "Tests live in `tests/` with the naming pattern `*.test.js`",
  contradicting the code-conventions skill.
- **Suggested fix:** Update `code-conventions/SKILL.md` to match reality
  — this repo's convention is `tests/` flat, which is a fine choice for
  a small repo. Or add an exception clause.
- **Confidence:** HIGH.

### F2. Test names describe behaviour — HIGH

- **Observed:** All test names are behaviour-oriented (`"exits 3 on a
  valid ESCALATE gate"`, `"appends pipeline and local-override entries
  to existing .gitignore"`). Compliant.
- **Verdict:** Compliant.

---

## G. Possibly Intentional Deviations

The following items look like deviations but have reasonable justifications:

1. **No co-located tests** — the repo has very few JS files; a single
   `tests/` directory is more ergonomic than spreading four files across
   four locations.
2. **Bloated `devDependencies`** (react, sharp, pptxgenjs, react-icons) —
   justified because the project ships the presentation builder in the
   same repo and the smoke test needs those modules' presence verified.
   Still worth splitting into an `optionalDependencies` group.
3. **`CLAUDE.md` empty** — intentional contract with the bootstrap
   installer (framework never overwrites user-owned files).
4. **Single maintainer + Claude coauthor** — no CODEOWNERS because the
   ownership is trivial; the convention doc says "One logical change per
   commit" and the history bears that out.
5. **Experimental env flag** — required for Agent Teams; a blocking
   dependency on Claude Code features.
6. **Magic numbers in `build-presentation.js`** — slide geometry.

---

## Summary counts

- **Findings total:** 16.
- **HIGH confidence:** 10 (A1, A2, A3, B1, B4, B5, C1, C2, D1, E1, F1, F2 —
  12 actually, some are pass-through).
- **MEDIUM confidence:** 4.
- **LOW confidence / intentional:** 2.
- **Blocking / P0-level:** 0 — there are no spec-violation bugs.
- **Actionable P1-level:** C1 (rsync), E1 (empty CLAUDE.md), B5 (dead
  lint script), C2 (misleading AGENTS.md branch), F1 (convention vs
  reality mismatch).
