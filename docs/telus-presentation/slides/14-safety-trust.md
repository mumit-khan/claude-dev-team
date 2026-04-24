---
layout: two-cols-header
transition: slide-left
---

# Claude acts autonomously — you decide the critical moments

::left::

<div class="col-header auto">Claude handles autonomously</div>

<ul class="trust-list">
  <li>✅ Read brief, design spec, and lessons-learned</li>
  <li>✅ Write code in the assigned area only</li>
  <li>✅ Run lint, type-check, and test suites</li>
  <li>✅ Write gate files in <code>pipeline/gates/</code></li>
  <li>✅ Derive approvals from review file markers</li>
  <li>✅ Stage 9 retrospective and lesson synthesis</li>
</ul>

::right::

<div class="col-header human">Requires your explicit decision</div>

<ul class="trust-list">
  <li>🔒 Proceeding past Checkpoint A, B, or C</li>
  <li>🔒 Resolving any <code>ESCALATE</code> gate</li>
  <li>🔒 Committing or pushing code</li>
  <li>🔒 Overriding a security-engineer veto</li>
  <li>🔒 Deploying to any environment</li>
  <li>🔒 Accepting or rejecting the roadmap delta</li>
</ul>

<div class="v25-note">
  <strong>v2.5 opt-in:</strong> Budget gate (token/wall-clock limits) · Async checkpoint auto-pass (<code>no_warnings</code> or <code>all_criteria_passed</code> conditions)
</div>

<style>
.slidev-layout { padding: 30px 50px 50px 50px; }
h1 { color: #4B286D; margin-bottom: 0.6em; font-size: 1.4em; }
.col-header { font-weight: 700; font-size: 0.92em; padding: 7px 14px; border-radius: 4px; margin-bottom: 12px; display: inline-block; }
.auto { background: #DCFCE7; color: #166534; }
.human { background: #FEE2E2; color: #B91C1C; }
.trust-list { list-style: none; margin-left: 0; padding: 0; }
.trust-list li { color: #2C2E30; font-size: 0.88em; line-height: 1.7; padding: 3px 0; border-bottom: 1px solid #F4F4F7; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.v25-note {
  margin-top: 14px;
  background: #EDE9F6;
  border-left: 4px solid #4B286D;
  padding: 8px 14px;
  border-radius: 4px;
  color: #2C2E30;
  font-size: 0.78em;
  line-height: 1.5;
}
.v25-note code { font-size: 0.9em; }
</style>

<!--
The trust model is intentional — Claude does the heavy lifting but the gates humans care about (code commit, deploy, security veto override) always require explicit approval.
v2.5 introduced async checkpoint auto-pass for teams that want to reduce interruptions on clean runs — but the security veto is never auto-passable.
-->
