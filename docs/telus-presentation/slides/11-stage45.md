---
layout: two-cols-header
transition: slide-left
---

# Automated checks catch issues before human review begins

::left::

<div class="gate-header green-header">4.5a — Always runs</div>
<div class="gate-agent">dev-platform</div>

<div class="check-list">
  <div class="check-item">
    <span class="check-dot green"></span>
    <div>
      <strong>Lint</strong>
      <div class="check-sub">ESLint / Prettier — zero warnings allowed</div>
    </div>
  </div>
  <div class="check-item">
    <span class="check-dot green"></span>
    <div>
      <strong>Type check</strong>
      <div class="check-sub"><code>tsc --noEmit</code> or equivalent — zero errors</div>
    </div>
  </div>
  <div class="check-item">
    <span class="check-dot green"></span>
    <div>
      <strong>SCA</strong>
      <div class="check-sub">Dependency vuln scan — no HIGH or CRITICAL findings</div>
    </div>
  </div>
  <div class="check-item">
    <span class="check-dot green"></span>
    <div>
      <strong>License check</strong>
      <div class="check-sub">All new deps on the project allowlist</div>
    </div>
  </div>
</div>

<div class="failure-note">On failure: owning dev is re-invoked to fix before Stage 5 starts.</div>

::right::

<div class="gate-header red-header">4.5b — Conditional</div>
<div class="gate-agent">security-engineer (Opus) · <span class="veto">VETO power</span></div>

<div class="trigger-label">Fires when diff touches:</div>
<ul class="trigger-list">
  <li><code>src/backend/</code> auth, crypto, payment, pii, session, *secret*, *token*</li>
  <li>New or upgraded dependencies (any package manager)</li>
  <li>Dockerfile / docker-compose — service image, network, or volume</li>
  <li><code>src/infra/</code> IAM, RBAC, network, firewall, certs, secrets, CI secret refs</li>
  <li>New DB migrations or new <code>.env.example</code> secret references</li>
</ul>

<div class="veto-box">
  <code>veto: true</code> halts the pipeline completely. No peer-review approval can override it. The security-engineer must personally re-review and flip the flag.
</div>

<style>
.slidev-layout { padding: 30px 50px 50px 50px; }
h1 { color: #4B286D; margin-bottom: 0.5em; font-size: 1.4em; }
.gate-header { font-weight: 700; font-size: 1em; padding: 6px 14px; border-radius: 4px; display: inline-block; margin-bottom: 4px; }
.green-header { background: #DCFCE7; color: #166534; }
.red-header { background: #FEE2E2; color: #B91C1C; }
.gate-agent { color: #676E73; font-size: 0.8em; margin-bottom: 10px; }
.veto { color: #B91C1C; font-weight: 700; }
.check-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.check-item { display: flex; align-items: flex-start; gap: 8px; font-size: 0.82em; color: #2C2E30; }
.check-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
.green { background: #2B8000; }
.check-sub { color: #676E73; font-size: 0.9em; margin-top: 1px; }
.failure-note { color: #676E73; font-size: 0.78em; font-style: italic; }
.trigger-label { color: #2C2E30; font-weight: 600; font-size: 0.82em; margin-bottom: 6px; }
.trigger-list { margin-left: 1em; margin-bottom: 10px; }
.trigger-list li { color: #2C2E30; font-size: 0.78em; line-height: 1.5; margin-bottom: 3px; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.veto-box {
  background: #FEE2E2;
  border-left: 4px solid #B91C1C;
  padding: 8px 12px;
  border-radius: 4px;
  color: #7F1D1D;
  font-size: 0.78em;
  line-height: 1.5;
}
.veto-box code { color: #7F1D1D; background: rgba(127,29,29,0.12); }
</style>

<!--
4.5a is always cheap to run and catches mechanical errors — no point spending human review tokens on a lint failure.
4.5b only fires when the diff touches a sensitive surface. The security-engineer is the only agent with veto power — it's not overrideable by the peer reviewers.
If 4.5b doesn't fire, the orchestrator writes a SECURITY-SKIP entry in context.md explaining why.
-->
