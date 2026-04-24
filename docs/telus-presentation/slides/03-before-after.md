---
layout: two-cols-header
transition: slide-left
---

# Structure transforms AI from unreliable to accountable

::left::

<div class="col-header bad">Without Structure</div>

- One Claude handles everything, unsupervised
- AI approves its own code — no peer review
- Security decided silently, no veto
- Context lost at every session boundary
- Same mistakes repeated every run
- Ship or halt — no checkpoints in between

::right::

<div class="col-header good">With Claude Dev Team</div>

- 7 scoped agents with strict file-area ownership
- Peer review by agents from different areas
- Security engineer holds veto power at Stage 4.5b
- Gates write to `pipeline/` — state survives sessions
- `lessons-learned.md` carries durable rules forward
- 3 human checkpoints before any code deploys

<style>
.slidev-layout { padding: 40px 60px 60px 60px; }
h1 { color: #4B286D; margin-bottom: 0.6em; font-size: 1.5em; }
.col-header {
  font-weight: 700;
  font-size: 1em;
  padding: 6px 14px;
  border-radius: 4px;
  margin-bottom: 14px;
  display: inline-block;
}
.bad { background: #FEE2E2; color: #B91C1C; }
.good { background: #DCFCE7; color: #166534; }
li { color: #2C2E30; font-size: 0.92em; line-height: 1.7; margin-bottom: 2px; }
code { background: #F4F4F7; color: #4B286D; padding: 1px 5px; border-radius: 3px; font-size: 0.88em; }
</style>

<!--
Left column: the chaotic status quo — one AI, no oversight, no memory.
Right column: what the framework delivers — scoped agents, peer review, veto-power security, persistent state, cumulative learning, human gates.
Highlight that the right column maps 1:1 to the left column's failure modes.
-->
