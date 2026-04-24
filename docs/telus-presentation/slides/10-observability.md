---
layout: default
transition: slide-left
---

# Four commands let you inspect and steer any live run

<div class="card-grid">
  <div class="card">
    <div class="card-cmd">/status</div>
    <div class="card-role">Gate dashboard</div>
    <div class="card-body">Reads all <code>pipeline/gates/*.json</code> and prints a stage-by-stage status table. Fastest way to see what passed, failed, or is pending.</div>
  </div>
  <div class="card">
    <div class="card-cmd">/pipeline-context</div>
    <div class="card-role">State dump</div>
    <div class="card-body">Full gate state + open <code>QUESTION:</code> entries. Run before <code>/compact</code> so the model preserves pipeline position across compaction.</div>
  </div>
  <div class="card">
    <div class="card-cmd">/resume &lt;N&gt;</div>
    <div class="card-role">Continue from stage N</div>
    <div class="card-body">Verifies all prior gates are PASS, then picks up at stage N. Use after a checkpoint approval, resolved ESCALATE, or manual mid-stage fix.</div>
  </div>
  <div class="card">
    <div class="card-cmd">/stage &lt;name&gt;</div>
    <div class="card-role">Re-run one stage</div>
    <div class="card-body">Invokes a single named stage with corrected input — without restarting the full pipeline.</div>
  </div>
</div>

<div class="more-cmds">
  <strong>More partial-pipeline commands:</strong>
  <code>/design</code> (Stages 1–2) · <code>/pipeline-brief</code> (Stage 1) · <code>/pipeline-review</code> (Stage 5 on current src/) · <code>/ask-pm</code> · <code>/adr</code> · <code>/principal-ruling</code>
</div>

<style>
.slidev-layout { padding: 40px 60px 60px 60px; }
h1 { color: #4B286D; margin-bottom: 0.7em; font-size: 1.45em; }
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
}
.card {
  background: #F4F4F7;
  border-left: 5px solid #4B286D;
  padding: 14px 16px;
  border-radius: 4px;
}
.card-cmd { font-family: 'Fira Code', monospace; color: #4B286D; font-weight: 700; font-size: 1em; margin-bottom: 2px; }
.card-role { color: #2B8000; font-size: 0.78em; font-style: italic; margin-bottom: 6px; }
.card-body { color: #2C2E30; font-size: 0.82em; line-height: 1.5; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.more-cmds {
  background: #EDE9F6;
  border-left: 4px solid #4B286D;
  padding: 8px 14px;
  border-radius: 4px;
  color: #2C2E30;
  font-size: 0.8em;
  line-height: 1.5;
}
.more-cmds strong { color: #4B286D; }
</style>

<!--
These four commands are your observability layer — you can drop into a running pipeline at any point.
/status is the first thing to run if you're unsure where the pipeline is.
/resume is for after human checkpoint approvals — it re-verifies all prior gates before continuing.
/stage is surgical — useful when you've manually fixed something and want one stage re-run.
-->
