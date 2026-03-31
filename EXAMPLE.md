# Example Pipeline Run

This document walks through a complete pipeline run for a real feature so
you know exactly what to expect at each stage.

**Feature**: "Add password reset via email"

---

## Starting the Pipeline

```
/pipeline Add password reset via email
```

The orchestrator reads `CLAUDE.md`, then `.claude/rules/pipeline.md`, then
`pipeline/context.md` (empty on a fresh run), then invokes the first agent.

---

## Stage 1 — Requirements (PM)

**Agent invoked**: `pm`  
**Input**: "Add password reset via email"

The PM agent writes `pipeline/brief.md`:

```markdown
# Feature Brief: Password Reset via Email

## Problem Statement
Users who forget their password have no self-service recovery path.
They must contact support, creating friction and support load.

## User Stories
1. As a user who forgot my password, I want to request a reset link
   via email so that I can regain access without contacting support.
2. As a user, I want the reset link to expire after 1 hour so that
   my account remains secure.
3. As a user, I want to be shown a success message even if my email
   isn't registered, so that account existence isn't leaked.

## Acceptance Criteria
1. POST /auth/password-reset accepts an email address and always returns 200
2. If the email is registered, a reset email is sent within 5 seconds
3. The reset link contains a signed token, expires in 1 hour
4. GET /auth/password-reset/:token validates the token and renders a reset form
5. POST /auth/password-reset/:token accepts new password, invalidates token
6. Passwords must be minimum 8 characters
7. Used or expired tokens return a clear error, not a 500

## Out of Scope
- SMS reset
- Social login recovery
- Admin-initiated password reset

## Open Questions
None at this time.
```

The PM writes `pipeline/gates/stage-01.json`:
```json
{
  "stage": "stage-01",
  "status": "PASS",
  "agent": "pm",
  "timestamp": "2026-03-26T10:00:00Z",
  "acceptance_criteria_count": 7,
  "out_of_scope_items": ["SMS reset", "Social login recovery"],
  "blockers": [],
  "warnings": []
}
```

The gate-validator hook fires, exits 0.

---

### ✋ Checkpoint A

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋  Checkpoint A — Requirements complete

The PM has written a brief with 7 acceptance criteria covering the full
password reset flow: request, email delivery, token validation, password
update, and security constraints. Out of scope: SMS and social login.

Review pipeline/brief.md if you'd like to adjust anything before design starts.

Type `proceed` to continue to design.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

You type: `proceed`

---

## Stage 2 — Design

### Step 2a: Principal drafts

**Agent invoked**: `principal`  
**Input**: `pipeline/brief.md`

The Principal writes `pipeline/design-spec.md` (STATUS: DRAFT) covering:
- System design: new `password_reset_tokens` table, email service integration
- API contracts: exact request/response shapes for all 3 endpoints
- Token design: HMAC-signed, stored hash only (not plaintext)
- Component ownership: backend owns all endpoints + token logic, platform owns email service infra
- Security: constant-time token comparison, rate limiting on POST /auth/password-reset

### Step 2b: Dev annotations (parallel)

All three devs are invoked in parallel (read-only). They append to
`pipeline/design-review-notes.md`:

```markdown
## dev-backend notes
- The spec doesn't mention rate limiting implementation — suggest express-rate-limit
  or a Redis-backed solution. QUESTION: do we have Redis in the stack? @PM

## dev-frontend notes
- The reset form needs a loading state spec — what do we show while the
  POST is in flight? Added as a concern for Principal to address.

## dev-platform notes
- The spec says "email sent within 5 seconds" — this implies synchronous send
  in the request path. For reliability this should be a queue.
  Flagging as architectural concern.
```

### Step 2c: Principal chairs review

The Principal reads the annotations. Addresses each:
- **Redis question** → writes `QUESTION: Do we have Redis in the stack? @PM` to `pipeline/context.md`. Implements with in-memory rate limiting for now, notes it as a known limitation in the ADR.
- **Loading state** → adds loading state spec to design-spec.md
- **Email queue** → accepts the platform dev's concern. Updates spec to use a queue. Writes ADR:

`pipeline/adr/0001-email-delivery-via-queue.md`:
```markdown
# 0001 — Email Delivery via Queue

**Status**: Accepted
**Date**: 2026-03-26

## Context
The brief requires email sent within 5 seconds. Synchronous send in the
request path risks timeouts and makes the API brittle on email provider failures.

## Decision
Send reset emails via an async job queue (BullMQ or equivalent).
The API returns 200 immediately; delivery happens within 5 seconds target.

## Rationale
- Decouples API reliability from email provider reliability
- Enables retry on delivery failure
- Direct synchronous send rejected: timeout risk, no retry

## Consequences
Platform dev must provision queue infrastructure. Adds complexity to local dev setup.
```

Principal updates `pipeline/design-spec.md` to APPROVED status.
PM is invoked to confirm scope fit → PM writes `"pm_approved": true` to stage-02 gate.

`pipeline/gates/stage-02.json`:
```json
{
  "stage": "stage-02",
  "status": "PASS",
  "agent": "principal",
  "arch_approved": true,
  "pm_approved": true,
  "adr_count": 1,
  "blockers": [],
  "warnings": ["Redis not confirmed — rate limiting uses in-memory for now"]
}
```

---

### ✋ Checkpoint B

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋  Checkpoint B — Design complete

The Principal has approved a design covering 3 API endpoints, a signed
token system, and async email delivery via queue. One ADR written
(email-via-queue). One warning: Redis not confirmed — rate limiting is
in-memory for now. One open PM question about Redis is logged.

Review pipeline/design-spec.md and pipeline/adr/ before build starts.

Type `proceed` to continue to build.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

You type: `proceed`

---

## Stage 3 — Pre-Build Clarification

Orchestrator checks `pipeline/context.md` for open questions.
Finds: `QUESTION: Do we have Redis in the stack? @PM`
Invokes PM agent to answer it.

PM checks the project setup (reads `src/` structure, package.json).
Finds Redis is not in the stack.

PM appends to `pipeline/context.md`:
```
QUESTION: Do we have Redis in the stack? @PM
PM-ANSWER: No Redis. Use in-memory rate limiting. Note this as a
production limitation in deploy-log.md.
```

No brief change needed. Pipeline proceeds immediately.

---

## Stage 4 — Build (parallel, git worktrees)

Three worktrees created:
```bash
git worktree add ../dev-team-backend feature/password-reset-backend
git worktree add ../dev-team-frontend feature/password-reset-frontend
git worktree add ../dev-team-platform feature/password-reset-platform
```

All three dev agents invoked in parallel.

**dev-backend** builds:
- `src/backend/routes/auth.js` — 3 endpoints
- `src/backend/services/tokenService.js` — HMAC token generation/validation
- `src/backend/models/passwordResetToken.js` — DB model
- Writes `pipeline/pr-backend.md` + `pipeline/gates/stage-04-backend.json`

**dev-frontend** builds:
- `src/frontend/pages/ForgotPassword.jsx`
- `src/frontend/pages/ResetPassword.jsx`
- Writes `pipeline/pr-frontend.md` + `pipeline/gates/stage-04-frontend.json`

**dev-platform** builds:
- `src/infra/queue/emailQueue.js` — BullMQ job queue
- `src/infra/email/resetEmailTemplate.js` — email template
- `.github/workflows/ci.yml` — CI pipeline update
- Writes `pipeline/pr-platform.md` + `pipeline/gates/stage-04-platform.json`

PostToolUse lint hooks fire after every file write. Any lint errors are
fixed before the PR gate is written.

---

## Stage 5 — Peer Code Review

Review matrix:
- `dev-backend` reviews: frontend + platform PRs
- `dev-frontend` reviews: backend + platform PRs
- `dev-platform` reviews: backend + frontend PRs

Each reviewer reads the brief, design spec, ADRs, then the changed files.

**An escalation occurs**: `dev-frontend`, reviewing `pr-backend.md`, finds
that the token endpoint returns the raw token in the response body (for
the reset email link). This contradicts the design spec which says "stored
hash only". Frontend dev writes:

```
ESCALATE: Backend endpoint POST /auth/password-reset/:token returns raw
token in response. Design spec (section 3.2) says only hashes are stored.
Either the spec is wrong or the implementation is wrong. Need Principal ruling.
```

Gate-validator detects exit code 3. Orchestrator surfaces to user:

```
🚨 Escalation — Stage 5 (Code Review)

Reason: Token handling contradiction between spec and implementation.
Decision needed: Should the reset link embed the raw token (implementation)
or should the email be sent server-side with no token in response (spec)?

Options:
  A — Email sent server-side. Token never leaves the backend. (spec intent)
  B — Return raw token in response, frontend constructs the link. (implementation)
```

You type: `A — email sent server-side`

Orchestrator records in `pipeline/context.md`:
```
## User Decisions
2026-03-26T11:30:00Z — Stage 5 escalation resolved:
Email sent server-side. Token never returned in API response.
Backend must be updated accordingly.
```

`/principal-ruling` invoked with the decision. Principal updates the design
spec, writes `pipeline/adr/0002-token-not-in-response.md`, routes the fix
back to `dev-backend`. Backend dev fixes the endpoint, re-submits PR.

Code review resumes. All three PRs get 2 approvals each.

---

## Stage 6 — Tests

`dev-platform` invoked. Writes and runs tests for all 7 acceptance criteria.

One test initially fails:
```
FAIL: src/tests/auth.test.js
  ✕ returns 200 for unregistered email (constant time)
    Expected status 200, received 404
```

Gate assigns fix to `dev-backend`. Backend dev fixes the route (missing
wildcard handling). Platform re-runs tests. All 7 pass.

`pipeline/gates/stage-06.json`:
```json
{
  "stage": "stage-06",
  "status": "PASS",
  "agent": "dev-platform",
  "all_acceptance_criteria_met": true,
  "tests_total": 23,
  "tests_passed": 23,
  "tests_failed": 0,
  "failing_tests": [],
  "assigned_retry_to": null,
  "blockers": [],
  "warnings": []
}
```

---

### ✋ Checkpoint C

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋  Checkpoint C — All tests pass

23/23 tests pass. All 7 acceptance criteria verified. One fix was needed
(404 for unregistered email) and was resolved before this checkpoint.

Review pipeline/test-report.md against pipeline/brief.md if you'd like
to verify coverage before deploy.

Type `proceed` to continue to PM sign-off and deploy.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

You type: `proceed`

---

## Stage 7 — PM Sign-off

PM reads `pipeline/test-report.md` and `pipeline/brief.md` side by side.
All 7 acceptance criteria confirmed. No delta.

```json
{
  "stage": "stage-07",
  "status": "PASS",
  "agent": "pm",
  "pm_signoff": true,
  "delta_items": [],
  "blockers": [],
  "warnings": ["Rate limiting is in-memory — production should use Redis"]
}
```

---

## Stage 8 — Deploy

`dev-platform` confirms `"pm_signoff": true` exists.
Executes deploy. Runs smoke tests.

```json
{
  "stage": "stage-08",
  "status": "PASS",
  "agent": "dev-platform",
  "environment": "production",
  "smoke_test_passed": true,
  "blockers": [],
  "warnings": []
}
```

PM writes stakeholder summary to `pipeline/deploy-log.md`:
> Password reset via email is now live. Users can request a reset link
> from the login page. Links expire after 1 hour. Note: rate limiting
> uses in-memory storage and should be migrated to Redis before high
> traffic events.

---

## Final Pipeline Status

```
Pipeline Status — Password Reset via Email
═══════════════════════════════════════════════════════════════
Stage                    Status      Agent           Notes
───────────────────────────────────────────────────────────────
01 Requirements          ✅ PASS     pm              7 criteria
02 Design                ✅ PASS     principal       2 ADRs
03 Clarification         ✅ PASS     pm              Redis: use in-memory
04a Build (backend)      ✅ PASS     dev-backend
04b Build (frontend)     ✅ PASS     dev-frontend
04c Build (platform)     ✅ PASS     dev-platform
05  Code Review          ✅ PASS     all devs        1 escalation resolved
06  Tests                ✅ PASS     dev-platform    23/23 pass
07  PM Sign-off          ✅ PASS     pm
08  Deploy               ✅ PASS     dev-platform    smoke tests pass
───────────────────────────────────────────────────────────────
⚠️  1 warning: Rate limiting in-memory — migrate to Redis before scale
```

---

## What the Example Illustrates

**The PM question in Stage 3** — a real ambiguity (Redis availability) was
caught before build started, not discovered mid-implementation.

**The escalation in Stage 5** — a contradiction between spec and code was
caught by a peer reviewer, not the author. The peer review cross-pollination
(frontend dev reading backend code) found something the backend dev wouldn't
self-catch.

**The test failure loop in Stage 6** — the gate correctly identified which
dev owned the failing test and routed the fix precisely. No retry storm.

**The warning propagation** — the Redis limitation surfaced in Stage 2 was
carried through gates as a warning all the way to the deploy log, so it
appears in the stakeholder summary and isn't silently forgotten.
