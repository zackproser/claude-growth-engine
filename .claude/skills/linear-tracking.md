---
name: linear-tracking
description: Consult and update Linear tickets before and after work
---

## Linear Workflow

### Before Starting Work
1. Check current subtasks under ZAC-208 via Linear MCP: `mcp__claude_ai_Linear__get_issue` with id `ZAC-208`
2. If the work maps to an existing ticket, set it to "In Progress"
3. If it's new work, create a subtask under ZAC-208 with clear description

### During Work
- Log significant decisions or findings in the ticket description
- If you discover a new issue while working, create a new subtask immediately

### After Completing Work
- Verify the fix works (run tests, check dev server, tail logs)
- Update the ticket description with what was done and how it was verified
- Set status to "Done" only after verification passes
- If verification fails, keep the ticket "In Progress" and note what failed

### Ticket Format
- Title: imperative, specific (e.g., "Fix voicemail override rejection" not "Voicemail stuff")
- Description: include root cause, fix applied, and verification steps
- Priority: 1=Urgent (demo-blocking), 2=High (important), 3=Medium (nice-to-have)

### Team/Project Info
- Team: ZAC (Zachary Proser)
- Parent: ZAC-208
- Assignee: "me"
