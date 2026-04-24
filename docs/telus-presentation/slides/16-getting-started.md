---
layout: default
transition: fade
---

# Getting Started in five steps

<div class="steps">
  <div class="step">
    <div class="step-num">1</div>
    <div class="step-content">
      <strong>Clone the repo</strong> — or copy <code>.claude/</code> and <code>bootstrap.sh</code> into your project
    </div>
  </div>
  <div class="step">
    <div class="step-num">2</div>
    <div class="step-content">
      <strong>Run bootstrap</strong> — <code>bash bootstrap.sh</code> installs agents, commands, rules, and hooks
    </div>
  </div>
  <div class="step">
    <div class="step-num">3</div>
    <div class="step-content">
      <strong>Type <code>/pipeline</code></strong> with a feature request to start the full 9-stage pipeline
    </div>
  </div>
  <div class="step">
    <div class="step-num">4</div>
    <div class="step-content">
      <strong>Use lighter tracks</strong> for smaller changes: <code>/quick</code> · <code>/nano</code> · <code>/hotfix</code>
    </div>
  </div>
  <div class="step">
    <div class="step-num">5</div>
    <div class="step-content">
      <strong>Stage 9 runs automatically</strong> after each pipeline, promoting lessons into <code>lessons-learned.md</code>
    </div>
  </div>
</div>

<div class="prereqs">
  <strong>Prerequisites:</strong> Claude Code CLI · Git repo · Node 20+ · 10 minutes
</div>

<div class="repo-link">github.com/mumit-khan/claude-dev-team</div>

<style>
.slidev-layout { padding: 40px 60px 60px 60px; }
h1 { color: #4B286D; margin-bottom: 0.8em; font-size: 1.5em; }
.steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.step {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #F4F4F7;
  border-radius: 6px;
  padding: 10px 16px;
}
.step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #4B286D;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1em;
  flex-shrink: 0;
}
.step-content { color: #2C2E30; font-size: 0.9em; line-height: 1.5; }
.step-content strong { color: #4B286D; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 5px; border-radius: 3px; font-size: 0.88em; }
.prereqs {
  background: #EDE9F6;
  border-left: 4px solid #4B286D;
  padding: 8px 16px;
  border-radius: 4px;
  color: #2C2E30;
  font-size: 0.85em;
  margin-bottom: 10px;
}
.prereqs strong { color: #4B286D; }
.repo-link {
  font-family: 'Fira Code', monospace;
  color: #2B8000;
  font-size: 1em;
  font-weight: 600;
}
</style>

<!--
Bootstrap installs the full .claude/ directory structure — agents, commands, rules, hooks, and settings.json with the hook registrations.
Once installed, the only command you need to remember is /pipeline for full runs.
The lighter tracks (/quick, /nano, /hotfix) are how you reduce overhead for day-to-day changes.
Stage 9 is always automatic — you don't need to remember to run it.
-->
