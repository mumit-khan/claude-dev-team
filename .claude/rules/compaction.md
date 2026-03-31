# Compaction Instructions

When Claude Code compacts this conversation, preserve:

1. The current pipeline stage being executed
2. The list of gate files written and their statuses
3. Any open escalations (status: ESCALATE in any gate file)
4. Any open QUESTION entries in pipeline/context.md awaiting PM-ANSWER
5. Which dev agents have completed their Stage 4 build tasks
6. Which reviewer agents have written their Stage 5 review files
7. The current retry count for any stage on its Nth retry

Do NOT preserve:
- Full file contents (re-read from disk as needed)
- Intermediate reasoning steps
- Tool call outputs that are already written to pipeline/ files
