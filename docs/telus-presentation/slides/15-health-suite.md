---
layout: default
transition: slide-left
---

# Four commands audit and monitor your codebase continuously

<div class="card-grid">
  <div class="card">
    <div class="card-cmd">/audit</div>
    <div class="card-when">Deep onboarding or periodic review</div>
    <div class="card-body">4-phase audit: <strong>Phase 0</strong> Architecture map · <strong>Phase 1</strong> Health (conventions, tests, docs) · <strong>Phase 2</strong> Deep Analysis (security, perf, complexity) · <strong>Phase 3</strong> Roadmap. Writes to <code>docs/audit/</code>.</div>
  </div>
  <div class="card">
    <div class="card-cmd">/audit-quick</div>
    <div class="card-when">Fast orientation or quick checkup</div>
    <div class="card-body">Phases 0–1 only. Architecture map + health findings in one pass. Good for onboarding onto an unfamiliar codebase.</div>
  </div>
  <div class="card">
    <div class="card-cmd">/health-check</div>
    <div class="card-when">Monthly cadence</div>
    <div class="card-body">Diffs current state against prior audit findings: new violations, untested components, stale docs, TODO/FIXME age, dependency changes. Writes <code>docs/audit/health-check-YYYY-MM.md</code>.</div>
  </div>
  <div class="card">
    <div class="card-cmd">/roadmap</div>
    <div class="card-when">Anytime — see what's next</div>
    <div class="card-body">Reads <code>docs/audit/10-roadmap.md</code> and prints a dashboard: batch progress, next 3 items, recently completed, stalled items, and systemic themes.</div>
  </div>
</div>

<div class="ext-note">
  Independent of the active pipeline — runs on existing code. Extensible via <code>docs/audit-extensions.md</code>.
</div>

<style>
.slidev-layout { padding: 40px 60px 60px 60px; }
h1 { color: #4B286D; margin-bottom: 0.7em; font-size: 1.45em; }
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 10px;
}
.card {
  background: #F4F4F7;
  border-left: 5px solid #4B286D;
  padding: 14px 16px;
  border-radius: 4px;
}
.card-cmd { font-family: 'Fira Code', monospace; color: #4B286D; font-weight: 700; font-size: 1em; margin-bottom: 2px; }
.card-when { color: #2B8000; font-size: 0.78em; font-style: italic; margin-bottom: 6px; }
.card-body { color: #2C2E30; font-size: 0.8em; line-height: 1.5; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.ext-note {
  background: #EDE9F6;
  border-left: 4px solid #4B286D;
  padding: 7px 14px;
  border-radius: 4px;
  color: #2C2E30;
  font-size: 0.8em;
}
.ext-note code { font-size: 0.9em; }
</style>

<!--
The health suite is a second mode of the framework — it's complementary to the pipeline, not part of it.
/audit is the comprehensive onboarding tool. /audit-quick is the 30-minute version.
/health-check is designed for monthly cadence — it compares against the prior audit baseline, so drift shows up clearly.
/roadmap is lightweight and can be run anytime to see what the audit identified as high-priority.
-->
