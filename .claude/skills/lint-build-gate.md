---
name: lint-build-gate
description: Run type-check and tests after every code change before declaring work complete
---

## Quality Gate Checklist

After ANY code change, you MUST run these commands before declaring the work done:

1. **Type-check**: `cd /Users/zachary/Dev/claude-growth-engine && npx tsc --noEmit`
2. **Tests**: `cd /Users/zachary/Dev/claude-growth-engine && pnpm test`
3. **Dev server health**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` — if not 200, restart it

If any of these fail:
- Fix the issue before moving on
- Do NOT tell the user "clean build" unless you actually ran the commands and they passed
- If the dev server is dead, restart with `pkill -f "next dev"; sleep 2; cd /Users/zachary/Dev/claude-growth-engine && pnpm dev &`

After changing server-side files (anything in `src/lib/` or `src/app/api/`), restart the dev server — in-memory state (cached agent IDs, voice call store) persists across hot reloads.
