---
layout: default
transition: slide-left
---

# Six tracks match scope and risk level

<table>
  <thead>
    <tr>
      <th>Command</th>
      <th>When to use</th>
      <th>Stages</th>
      <th>Approvals</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/pipeline</code></td>
      <td>Multi-area, auth / PII / migration / new external dep</td>
      <td>1–9 full</td>
      <td>2 per area (matrix)</td>
    </tr>
    <tr class="alt">
      <td><code>/quick</code></td>
      <td>≤ ~100 LOC, single area, no safety-stoplist item</td>
      <td>1→4→5→6→7→8→9</td>
      <td>1 per area (scoped)</td>
    </tr>
    <tr>
      <td><code>/nano</code></td>
      <td>Typo, comment, dead import — zero runtime effect</td>
      <td>4→6→7 (auto)</td>
      <td>None</td>
    </tr>
    <tr class="alt">
      <td><code>/hotfix</code></td>
      <td>Critical production bug, expedited path</td>
      <td>4→4.5b→5→6→7→8→9</td>
      <td>2 per area</td>
    </tr>
    <tr>
      <td><code>/config-only</code></td>
      <td>Config values only — no code logic change</td>
      <td>4→4.5a→6→8</td>
      <td>N/A</td>
    </tr>
    <tr class="alt">
      <td><code>/dep-update</code></td>
      <td>Dependency upgrade with SCA + changelog scan</td>
      <td>4→5→6→8</td>
      <td>1 (supply-chain)</td>
    </tr>
  </tbody>
</table>

<div class="stoplist">
  ⚠️ <strong>Safety stoplist</strong> — <code>/pipeline</code> is mandatory for: auth · crypto · PII · payments · schema migrations · new external deps · feature-flag introduction
</div>

<style>
.slidev-layout { padding: 40px 60px 60px 60px; }
h1 { color: #4B286D; margin-bottom: 0.7em; font-size: 1.5em; }
table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
thead tr { background: #4B286D; }
thead th { color: #FFFFFF; padding: 10px 14px; text-align: left; }
tbody td { color: #2C2E30; padding: 8px 14px; }
tr.alt { background: #F4F4F7; }
code { background: rgba(255,255,255,0.15); color: #4B286D; padding: 1px 5px; border-radius: 3px; font-size: 0.88em; }
thead th:first-child code { color: #FFFFFF; background: rgba(255,255,255,0.2); }
tbody code { color: #4B286D; background: #EDE9F6; }
.stoplist {
  margin-top: 14px;
  background: #FEE2E2;
  border-left: 4px solid #B91C1C;
  padding: 8px 16px;
  border-radius: 4px;
  color: #7F1D1D;
  font-size: 0.82em;
  line-height: 1.5;
}
.stoplist code { color: #7F1D1D; background: rgba(127,29,29,0.1); }
</style>

<!--
Choose the lightest track that is still safe for your change.
The safety stoplist is the key guard — any item on that list forces /pipeline regardless of change size.
/hotfix is expedited but not lightweight — it still requires peer review and security check when the heuristic fires.
-->
