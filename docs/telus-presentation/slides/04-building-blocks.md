---
layout: default
transition: slide-left
---

# Five primitives express every framework feature

<div class="pillars">
  <div class="pillar">
    <div class="pillar-icon">👥</div>
    <div class="pillar-title">Agents</div>
    <div class="pillar-sub">Scoped AI actors</div>
    <div class="pillar-body">7 roles. Each owns specific file areas. Cannot touch another agent's files.</div>
  </div>
  <div class="pillar">
    <div class="pillar-icon">⌨️</div>
    <div class="pillar-title">Commands</div>
    <div class="pillar-sub">You type, pipeline runs</div>
    <div class="pillar-body"><code>/pipeline</code> — 9 stages. <code>/quick</code> — single area. <code>/nano</code> — trivial edits.</div>
  </div>
  <div class="pillar">
    <div class="pillar-icon">🧠</div>
    <div class="pillar-title">Skills</div>
    <div class="pillar-sub">Loaded automatically</div>
    <div class="pillar-body">Passive knowledge — coding standards, security checklists. No pasting required.</div>
  </div>
  <div class="pillar">
    <div class="pillar-icon">📋</div>
    <div class="pillar-title">Rules</div>
    <div class="pillar-sub">Always-on constraints</div>
    <div class="pillar-body">Files in <code>.claude/rules/</code> read at startup — pipeline stages, gates, escalation.</div>
  </div>
  <div class="pillar">
    <div class="pillar-icon">🔗</div>
    <div class="pillar-title">Hooks</div>
    <div class="pillar-sub">Post-action automation</div>
    <div class="pillar-body">Shell scripts after Claude writes files. <code>gate-validator.js</code> enforces gate integrity.</div>
  </div>
</div>

<style>
.slidev-layout { padding: 40px 60px 60px 60px; }
h1 { color: #4B286D; margin-bottom: 0.8em; font-size: 1.5em; }
.pillars {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.pillar {
  background: #F4F4F7;
  border-top: 4px solid #4B286D;
  padding: 16px 14px;
  border-radius: 4px;
  text-align: center;
}
.pillar-icon { font-size: 1.6em; margin-bottom: 6px; }
.pillar-title { color: #4B286D; font-weight: 700; font-size: 0.95em; margin-bottom: 2px; }
.pillar-sub { color: #2B8000; font-size: 0.75em; margin-bottom: 8px; font-style: italic; }
.pillar-body { color: #2C2E30; font-size: 0.78em; line-height: 1.5; }
code { background: #fff; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
</style>

<!--
Five orthogonal primitives — understanding these is the unlock to customising the framework.
Agents = who does what. Commands = how you invoke work. Skills = passive knowledge. Rules = always-on constraints. Hooks = automated post-processing.
Everything in the framework is expressed through exactly one of these five.
-->
