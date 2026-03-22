# CLAUDE.md — Claude Growth Engine

## Project Overview
Agentic outbound growth system built on the Claude Agent SDK. Analyzes prospect companies, generates personalized outreach suites (email, demo page, value props, LinkedIn, voicemail), and places autonomous outbound voice calls via ElevenLabs.

## Tech Stack
- **Framework**: Next.js 16 / React 19 / TypeScript
- **AI**: Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) — spawns Claude Code subprocess for multi-turn agent reasoning
- **Voice**: ElevenLabs Conversational AI (`@elevenlabs/elevenlabs-js`) — outbound calls with cloned voice, voicemail detection
- **Tracking**: In-memory event store + optional Google Sheets via MCP
- **Package Manager**: pnpm

## Key Architecture
- `src/lib/agent.ts` — Core agent orchestration. `runGrowthAgent()` uses `query()` from Agent SDK with WebSearch/WebFetch tools
- `src/lib/voice.ts` — ElevenLabs agent creation + outbound call placement. Creates one reusable agent with `builtInTools` (end_call, voicemail_detection), overrides `firstMessage` per call
- `src/lib/scoring.ts` — Lead scoring with signal weights (voice signals: call_placed=10, delivered=20, listened=35)
- `src/lib/types.ts` — All type definitions
- `src/app/api/analyze/route.ts` — SSE streaming endpoint. Runs agent → places voice call → streams progress
- `src/app/api/voice/route.ts` — Voice call status polling
- `src/app/target/page.tsx` — Analysis progress UI with Claude logo spinner + step list

## Critical Patterns

### Agent SDK
- The Agent SDK spawns a `claude` CLI subprocess. Version compatibility between CLI and SDK is critical.
- If you see "Claude Code process exited with code 1", check CLI version (`claude --version`) matches SDK expectations.
- Current working combo: CLI 2.1.81 + SDK 0.2.81

### ElevenLabs Voice
- Agent is created via API with `platformSettings.overrides.conversationConfigOverride.agent.firstMessage: true` — this MUST be set or per-call script overrides are rejected (error 1008)
- `builtInTools` (not `tools` array) is the correct location for system tools like `voicemail_detection` and `end_call`
- `voicemailMessage` supports `{{dynamic_variables}}` — pass via `conversationInitiationClientData.dynamicVariables`
- Agent version is tracked in-memory (`AGENT_VERSION` constant) — bump it when changing agent config, restart dev server to clear cache

### SSE Streaming
- The `send()` function in analyze route MUST be wrapped in try/catch — the idle timer in agent.ts can fire after the stream closes
- `clearInterval(idleInterval)` MUST be in a `finally` block around the `for await` query loop

## Commands
```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm test         # Run Jest test suite
npx tsc --noEmit  # Type-check
```

## Quality Gates
- **ALWAYS** run `npx tsc --noEmit` after code changes
- **ALWAYS** run `pnpm test` before declaring work complete
- **ALWAYS** restart dev server after changing server-side code (agent.ts, voice.ts, route handlers) — in-memory state persists
- **ALWAYS** check ElevenLabs conversation logs via API when debugging voice issues

## Environment Variables
```
ANTHROPIC_API_KEY          # Claude API key
ELEVENLABS_API_KEY         # ElevenLabs API key
ELEVENLABS_VOICE_ID        # Cloned voice ID
ELEVENLABS_PHONE_NUMBER_ID # Twilio number imported into ElevenLabs
DEMO_PHONE_NUMBER          # Target phone for demo calls
GOOGLE_SHEET_ID            # Optional: Google Sheets tracking
GOOGLE_ACCESS_TOKEN        # Optional: Google Sheets auth
```

## Linear Tracking
- Parent ticket: ZAC-208
- All work tracked as subtasks under ZAC-208
- Check Linear before starting work, create subtasks for new issues, close after verification

## Lessons Learned
1. Agent SDK + CLI version mismatch causes silent "exit code 1" failures — always verify compatibility
2. ElevenLabs `platformSettings.overrides` defaults block per-call overrides — must explicitly allow
3. `builtInTools` vs `tools` array — system tools go in `builtInTools`, custom tools go in `tools`
4. `setInterval` in SSE streaming handlers WILL crash Node if not cleaned up — always try/finally
5. Dev server hot-reloads frontend but NOT server module state — restart to clear cached agent IDs
