---
layout: default
transition: slide-left
---

# Nine stages, three checkpoints, no blind spots

<div class="flow">
  <div class="stage s1"><span class="n">1</span><span class="l">Brief</span><span class="a">PM</span></div>
  <div class="arrow">→</div>
  <div class="stage s2"><span class="n">2</span><span class="l">Design</span><span class="a">Principal</span></div>
  <div class="arrow">→</div>
  <div class="stage s3"><span class="n">3</span><span class="l">Clarify</span><span class="a">PM</span></div>
  <div class="arrow">→</div>
  <div class="stage s4"><span class="n">4</span><span class="l">Build</span><span class="a">3 Devs</span></div>
  <div class="arrow">→</div>
  <div class="stage s45"><span class="n">4.5</span><span class="l">Pre-review</span><span class="a">Platform</span></div>
  <div class="arrow">→</div>
  <div class="stage s5"><span class="n">5</span><span class="l">Review</span><span class="a">Agents</span></div>
  <div class="arrow">→</div>
  <div class="stage s6"><span class="n">6</span><span class="l">Test</span><span class="a">QA Dev</span></div>
  <div class="arrow">→</div>
  <div class="stage s7"><span class="n">7</span><span class="l">Sign-off</span><span class="a">PM</span></div>
  <div class="arrow">→</div>
  <div class="stage s8"><span class="n">8</span><span class="l">Deploy</span><span class="a">Platform</span></div>
  <div class="arrow">→</div>
  <div class="stage s9"><span class="n">9</span><span class="l">Retro</span><span class="a">All agents</span></div>
</div>

<div class="checkpoints">
  <span class="cp">🔵 A — After Stage 1: brief ready</span>
  <span class="cp">🔵 B — After Stage 2: design approved</span>
  <span class="cp">🔵 C — After Stage 6: tests pass</span>
  <span class="gate-rule">Every stage writes <code>pipeline/gates/stage-XX.json</code> — status: <code>PASS</code> | <code>FAIL</code> | <code>ESCALATE</code></span>
</div>

<div class="desc-grid">
  <div class="desc"><strong>Stage 1</strong> PM writes <code>brief.md</code> — acceptance criteria and scope.</div>
  <div class="desc"><strong>Stage 2</strong> Principal drafts design spec; devs annotate; Principal chairs review + ADRs.</div>
  <div class="desc"><strong>Stage 4</strong> 3 devs build in parallel git worktrees across backend / frontend / infra.</div>
  <div class="desc"><strong>Stage 4.5</strong> 4.5a: lint + SCA always. 4.5b: security-engineer when heuristic fires.</div>
  <div class="desc"><strong>Stage 5</strong> Cross-area peer review. <code>approval-derivation.js</code> writes the gate.</div>
  <div class="desc"><strong>Stage 9</strong> All agents contribute. Principal synthesises. Lessons promoted to <code>lessons-learned.md</code>.</div>
</div>

<style>
.slidev-layout { padding: 30px 50px 50px 50px; }
h1 { color: #4B286D; margin-bottom: 0.5em; font-size: 1.4em; }
.flow {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 10px;
  flex-wrap: nowrap;
}
.stage {
  background: #4B286D;
  color: #fff;
  border-radius: 4px;
  padding: 6px 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  text-align: center;
}
.s9 { background: #2B8000; }
.n { font-size: 1em; font-weight: 700; }
.l { font-size: 0.65em; margin-top: 2px; font-weight: 600; }
.a { font-size: 0.58em; color: rgba(255,255,255,0.75); margin-top: 1px; }
.arrow { color: #676E73; font-size: 0.8em; }
.checkpoints {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #F4F4F7;
  padding: 8px 14px;
  border-radius: 4px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.cp { color: #2C2E30; font-size: 0.78em; }
.gate-rule { color: #676E73; font-size: 0.75em; margin-left: auto; }
code { background: #EDE9F6; color: #4B286D; padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.desc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.desc {
  background: #fff;
  border: 1px solid #E3E6E8;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.78em;
  color: #2C2E30;
  line-height: 1.4;
}
.desc strong { color: #4B286D; }
</style>

<!--
Human checkpoints A, B, C are where Claude halts and waits for your "proceed".
The gate files in pipeline/gates/ are what the validator hook reads — JSON with status: PASS, FAIL, or ESCALATE.
No gate = pipeline blocked. Wrong fields = validator exits non-zero.
Stage 3 (Clarify) is usually a no-op — it only does work if there are open QUESTION: entries in context.md.
-->
