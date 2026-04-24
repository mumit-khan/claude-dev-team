---
layout: two-cols-header
transition: slide-left
---

# Cross-area reviewers approve — a hook writes the gate

::left::

<div class="review-header scoped">Scoped review · required_approvals: 1</div>

**When:** Diff is area-contained — all changes in one area.

| Area | Reviewed by |
|---|---|
| `src/backend/` | dev-platform |
| `src/frontend/` | dev-backend |
| `src/infra/` | dev-backend |
| `src/tests/` | dev-backend |

<div class="note-box">Orchestrator must pre-create the gate with <code>required_approvals: 1</code> before invoking the reviewer — otherwise the hook defaults to 2.</div>

::right::

<div class="review-header matrix">Matrix review · required_approvals: 2</div>

**When:** Diff crosses more than one area.

| Reviewer | Reviews |
|---|---|
| dev-backend | frontend + platform |
| dev-frontend | backend + platform |
| dev-platform | backend + frontend |

<div class="note-box">Gate reaches PASS when <code>approvals.length ≥ required_approvals</code> AND <code>changes_requested</code> is empty.</div>

<div class="readonly-rule">
  <strong>READ-ONLY rule:</strong> Reviewers write only to <code>pipeline/code-review/by-{reviewer}.md</code>. No <code>src/</code> edits — ever. Bug found? Write <code>REVIEW: CHANGES REQUESTED</code>, list the BLOCKER, halt. The owning dev fixes it.
</div>

<style>
.slidev-layout { padding: 30px 50px 50px 50px; }
h1 { color: #4B286D; margin-bottom: 0.5em; font-size: 1.4em; }
.review-header { font-weight: 700; font-size: 0.9em; padding: 6px 12px; border-radius: 4px; margin-bottom: 8px; display: inline-block; }
.scoped { background: #EDE9F6; color: #4B286D; }
.matrix { background: #DCFCE7; color: #166534; }
p { color: #2C2E30; font-size: 0.85em; margin-bottom: 8px; }
table { width: 100%; border-collapse: collapse; font-size: 0.8em; margin-bottom: 8px; }
thead th { background: #4B286D; color: #fff; padding: 6px 10px; text-align: left; }
tbody td { padding: 5px 10px; color: #2C2E30; border-bottom: 1px solid #E3E6E8; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.note-box {
  background: #F4F4F7;
  border-left: 3px solid #676E73;
  padding: 7px 10px;
  border-radius: 3px;
  color: #2C2E30;
  font-size: 0.78em;
  line-height: 1.4;
  margin-bottom: 6px;
}
.note-box code { font-size: 0.9em; }
.readonly-rule {
  background: #FEE2E2;
  border-left: 4px solid #B91C1C;
  padding: 8px 12px;
  border-radius: 4px;
  color: #7F1D1D;
  font-size: 0.78em;
  line-height: 1.5;
  margin-top: 8px;
}
.readonly-rule code { color: #7F1D1D; background: rgba(127,29,29,0.1); }
</style>

<!--
The orchestrator chooses scoped vs matrix before Stage 5 begins — based on which file areas the diff touches.
The READ-ONLY rule is critical: inline fixes by reviewers bypass the owning dev and skip re-review of those lines. The rule has no exceptions, not even for "obvious" one-liners.
approval-derivation.js is authoritative — agents that write approvals[] directly get overwritten on the next file save.
-->
