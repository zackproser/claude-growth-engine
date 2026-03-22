---
name: elevenlabs-diagnostics
description: Debug ElevenLabs voice call issues by checking conversation logs and agent config via API
---

## When to Use
When a voice call fails, doesn't ring, or doesn't leave a voicemail.

## Diagnostic Steps

1. **Check recent conversations**:
```bash
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/convai/conversations?page_size=5" | python3 -m json.tool
```

2. **Get conversation details** (use conversation_id from above):
```bash
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/convai/conversations/<CONVERSATION_ID>" | python3 -m json.tool
```

3. **Check agent config** (verify overrides, builtInTools):
```bash
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/convai/agents/<AGENT_ID>" | python3 -m json.tool
```

4. **List all agents** (check for stale/duplicate agents):
```bash
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/convai/agents?page_size=10" | python3 -m json.tool
```

## Common Failure Modes
- `Override for field 'first_message' is not allowed` → agent missing `platformSettings.overrides.conversationConfigOverride.agent.firstMessage: true`
- `message_count: 0, status: failed` → call connected to Twilio but agent config was rejected
- Call rings but no voicemail → voicemail_detection must be in `builtInTools`, not `tools` array
- Agent not using latest config → restart dev server to clear `cachedAgentId`

## API Key Location
Read from `/Users/zachary/Dev/claude-growth-engine/.env.local` (ELEVENLABS_API_KEY)
