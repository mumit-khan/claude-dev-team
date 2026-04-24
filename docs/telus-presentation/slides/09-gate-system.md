---
layout: two-cols-header
transition: slide-left
---

# Gates block pipeline progress until each stage passes

::left::

<div class="statuses">
  <div class="status pass">
    <span class="label">PASS</span>
    <span class="desc">Stage completed. Pipeline advances automatically.</span>
  </div>
  <div class="status fail">
    <span class="label">FAIL</span>
    <span class="desc">Clear fix exists. Owning dev re-invoked. Retry limit: 3. Same failure twice → auto-escalate.</span>
  </div>
  <div class="status escalate">
    <span class="label">ESCALATE</span>
    <span class="desc">Human input required. Pipeline halts. Orchestrator surfaces reason + options.</span>
  </div>
</div>

<div class="hook-box">
  <div class="hook-title">gate-validator.js</div>
  <div class="hook-sub">After every subagent stop</div>
  Checks for bypassed ESCALATEs, missing fields, retry integrity. Exits non-zero to halt.
</div>

<div class="hook-box">
  <div class="hook-title">approval-derivation.js</div>
  <div class="hook-sub">After Write/Edit on review files</div>
  Parses <code>REVIEW: APPROVED</code> markers → writes <code>approvals[]</code> into stage-05 gate. Agents cannot self-approve.
</div>

::right::

<div class="schema-label">Required fields — every gate:</div>

```json
{
  "stage":     "stage-05-backend",
  "status":    "PASS",
  "agent":     "dev-frontend",
  "timestamp": "2026-04-23T14:22:00Z",
  "track":     "full",
  "blockers":  [],
  "warnings":  []
}
```

<style>
.slidev-layout { padding: 30px 50px 50px 50px; }
h1 { color: #4B286D; margin-bottom: 0.6em; font-size: 1.45em; }
.statuses { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.status {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.82em;
}
.pass { background: #DCFCE7; }
.fail { background: #FEE2E2; }
.escalate { background: #EDE9F6; }
.label { font-weight: 700; min-width: 72px; }
.pass .label { color: #166534; }
.fail .label { color: #B91C1C; }
.escalate .label { color: #4B286D; }
.desc { color: #2C2E30; line-height: 1.4; }
.hook-box {
  background: #F4F4F7;
  border-left: 4px solid #4B286D;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.78em;
  color: #2C2E30;
  margin-bottom: 8px;
  line-height: 1.4;
}
.hook-title { color: #4B286D; font-family: 'Fira Code', monospace; font-weight: 700; font-size: 0.95em; }
.hook-sub { color: #676E73; font-style: italic; font-size: 0.88em; margin-bottom: 4px; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; }
.schema-label { color: #4B286D; font-weight: 600; font-size: 0.85em; margin-bottom: 6px; }
</style>

<!--
Gates are JSON files in pipeline/gates/. They're machine-readable — the orchestrator reads JSON, not prose.
Two hooks enforce integrity: gate-validator catches structural problems, approval-derivation prevents self-approval.
The bypass-escalation check is important: if you write a later gate without resolving an ESCALATE, the validator exits 3 and halts.
-->
