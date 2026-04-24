---
layout: default
transition: slide-left
---

# Stage 9 makes the team smarter after every run

<div class="retro-layout">
  <div class="step step-a">
    <div class="step-header">Step 9a — Contribution (parallel)</div>
    <div class="step-body">
      6–7 agents invoked in parallel. Each appends to <code>pipeline/retrospective.md</code> using four headings:
      <ul>
        <li>What worked</li>
        <li>What I got wrong (and how I noticed)</li>
        <li>Where the pipeline slowed me down</li>
        <li>One lesson worth carrying forward <em>(required — no opting out)</em></li>
      </ul>
    </div>
  </div>

  <div class="arrow-right">→</div>

  <div class="step step-b">
    <div class="step-header">Step 9b — Synthesis (Principal)</div>
    <div class="step-body">
      Reads all contributions + current <code>lessons-learned.md</code>:
      <ul>
        <li>Promotes up to <strong>2</strong> new rules</li>
        <li>Retires rules proven wrong or reinforced ≥5 times</li>
        <li>Auto-ages out rules not hit in 10 runs</li>
        <li>Harvests <code>PATTERN:</code> entries from Stage 5 reviews</li>
      </ul>
    </div>
  </div>
</div>

<div class="lessons-box">
  <div class="lessons-title">pipeline/lessons-learned.md — persists across resets</div>
  <div class="lessons-body">
    <div class="rule-example">
      <code>### L007 — Clarify notify channel in brief</code><br/>
      <code>Added: 2026-04-17 &nbsp;|&nbsp; Reinforced: 2 (last: 2026-04-21)</code><br/>
      <code>Rule: When the brief uses "notify", ask PM: email, push, or inline UI?</code>
    </div>
    <div class="rubric">
      <span class="sev green">green</span> Zero escalations, retries, or post-build BLOCKERs &nbsp;·&nbsp;
      <span class="sev yellow">yellow</span> At least one retry or self-resolved ESCALATE &nbsp;·&nbsp;
      <span class="sev red">red</span> Defect shipped or gate bypassed
    </div>
  </div>
</div>

<style>
.slidev-layout { padding: 30px 50px 50px 50px; }
h1 { color: #4B286D; margin-bottom: 0.6em; font-size: 1.4em; }
.retro-layout { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
.step { background: #F4F4F7; border-top: 4px solid #4B286D; padding: 12px 16px; border-radius: 4px; flex: 1; }
.step-b { border-top-color: #2B8000; }
.step-header { color: #4B286D; font-weight: 700; font-size: 0.88em; margin-bottom: 6px; }
.step-b .step-header { color: #166534; }
.step-body { color: #2C2E30; font-size: 0.8em; line-height: 1.5; }
.step-body ul { margin-left: 1.2em; margin-top: 4px; }
.step-body li { margin-bottom: 2px; }
.arrow-right { color: #676E73; font-size: 1.4em; padding-top: 40px; flex-shrink: 0; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.lessons-box { background: #1E1042; padding: 12px 16px; border-radius: 6px; }
.lessons-title { color: #9F84D0; font-size: 0.82em; font-weight: 600; margin-bottom: 8px; }
.rule-example { font-family: 'Fira Code', monospace; font-size: 0.72em; color: #66CC00; margin-bottom: 8px; line-height: 1.5; }
.rubric { font-size: 0.75em; color: #9F84D0; }
.sev { font-weight: 700; padding: 1px 6px; border-radius: 3px; margin-right: 4px; }
.sev.green { background: #2B8000; color: #fff; }
.sev.yellow { background: #D97706; color: #fff; }
.sev.red { background: #B91C1C; color: #fff; }
</style>

<!--
Stage 9 is non-optional and runs after every pipeline — success or failure. Failed runs are actually more valuable.
The "one lesson required" rule prevents agents from opting out with a generic "good run" summary.
lessons-learned.md is the durable output — it survives /reset and is loaded at the start of every future run.
The age-out rule (10 runs without reinforcement) keeps the file from accumulating stale advice.
-->
