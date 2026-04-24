---
layout: default
transition: slide-left
---

# Seven agents enforce area boundaries automatically

<table>
  <thead>
    <tr>
      <th>Agent</th>
      <th>Model</th>
      <th>Stage(s)</th>
      <th>Owns</th>
      <th>Boundary</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>PM</strong></td>
      <td>Opus</td>
      <td>1, 3, 7, 9</td>
      <td>brief.md, acceptance criteria, sign-off</td>
      <td><code>pipeline/</code> only — never edits <code>src/</code></td>
    </tr>
    <tr class="alt">
      <td><strong>Principal</strong></td>
      <td>Opus</td>
      <td>2, 5*, 9</td>
      <td>Design spec, ADRs, review chair, synthesis</td>
      <td>Read + Bash read-only; no <code>src/</code> writes</td>
    </tr>
    <tr>
      <td><strong>dev-backend</strong></td>
      <td>Sonnet</td>
      <td>4, 5, 9</td>
      <td>APIs, services, data layer</td>
      <td><code>src/backend/</code> only</td>
    </tr>
    <tr class="alt">
      <td><strong>dev-frontend</strong></td>
      <td>Sonnet</td>
      <td>4, 5, 9</td>
      <td>UI components, client logic</td>
      <td><code>src/frontend/</code> only</td>
    </tr>
    <tr>
      <td><strong>dev-platform</strong></td>
      <td>Sonnet</td>
      <td>4, 4.5a, 5, 8, 9</td>
      <td>CI/CD, infra, lint/SCA, adapter-driven deploy</td>
      <td><code>src/infra/</code> only</td>
    </tr>
    <tr class="alt">
      <td><strong>dev-qa</strong></td>
      <td>Sonnet</td>
      <td>6, 9</td>
      <td>Authors tests, runs Stage 6 CI</td>
      <td><code>src/tests/</code> only</td>
    </tr>
    <tr>
      <td><strong>security-eng</strong></td>
      <td>Opus</td>
      <td>4.5b, 5**, 9***</td>
      <td>Threat model — <span class="veto">VETO power</span></td>
      <td>Read-only — veto power only</td>
    </tr>
  </tbody>
</table>

<div class="footnotes">
  <span>* escalation / deadlock only</span>
  <span>** second signal on stage-05 gate</span>
  <span>*** only when 4.5b fired</span>
</div>
<div class="boundary-rule">Area boundary rule: <code>dev-backend</code> cannot write <code>src/frontend/</code> even if it would be "quicker". Cross-boundary edits require a <code>CONCERN:</code> in <code>pipeline/context.md</code> first.</div>

<style>
.slidev-layout { padding: 30px 50px 50px 50px; }
h1 { color: #4B286D; margin-bottom: 0.6em; font-size: 1.4em; }
table { width: 100%; border-collapse: collapse; font-size: 0.8em; }
thead tr { background: #4B286D; }
thead th { color: #FFFFFF; padding: 9px 12px; text-align: left; }
tbody td { color: #2C2E30; padding: 7px 12px; }
tr.alt { background: #F4F4F7; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.veto { color: #B91C1C; font-weight: 700; }
.footnotes { display: flex; gap: 20px; margin-top: 8px; color: #676E73; font-size: 0.72em; font-style: italic; }
.boundary-rule {
  margin-top: 8px;
  background: #FFF3CD;
  border-left: 4px solid #D97706;
  padding: 7px 14px;
  border-radius: 4px;
  color: #78350F;
  font-size: 0.78em;
}
.boundary-rule code { color: #78350F; background: rgba(120,53,15,0.1); }
</style>

<!--
The boundary rule is structural — it's enforced by the agent definitions, not just convention.
Opus agents (PM, Principal, security-engineer) handle judgment-heavy work. Sonnet agents handle implementation.
The security-engineer's veto cannot be overridden by peer-review approvals — it requires a personal re-review.
-->
