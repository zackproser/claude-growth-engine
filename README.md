<div align="center">

<img src="img/claude-logo.svg" alt="Claude" width="56" />

# Claude Growth Engine

**Autonomous AI sales agent that researches prospects, generates personalized outreach, and places live calls — powered by Claude Agent SDK**

<img src="img/powered-by-claude.svg" alt="Powered by Claude Agent SDK" height="32" />

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Claude Agent SDK](https://img.shields.io/badge/Claude-Agent%20SDK-D97757?style=for-the-badge)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-E8C547?style=for-the-badge)](LICENSE)

</div>

---

## What It Does

Give it a prospect URL and an OpenAPI spec. It handles the rest.

- 🔍 **Autonomous Research** — Agent browses the prospect's site, identifies pain points, maps their tech stack, and pulls their branding
- ✉️ **Personalized Outreach** — Generates a cold email, branded demo page, value proposition, LinkedIn message, and voicemail script
- 📞 **Live Voice Calls** — Places outbound calls using a cloned founder voice via ElevenLabs with voicemail detection
- 📋 **Post-Call Intelligence** — Captures call transcripts and generates follow-up insights automatically
- 📈 **Real-Time Lead Scoring** — Tracks engagement signals across every touchpoint and surfaces the hottest prospects

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Prospect URL ──► Claude Agent SDK                             │
│                    (research + analysis)                         │
│                         │                                       │
│                         ▼                                       │
│                    Outreach Suite                                │
│                    ├── Cold Email                                │
│                    ├── Branded Demo Page                         │
│                    ├── Value Proposition                         │
│                    ├── LinkedIn Message                          │
│                    └── Voicemail Script                          │
│                         │                                       │
│                         ▼                                       │
│                    ElevenLabs Voice Call                         │
│                    (cloned founder voice + voicemail detection)  │
│                         │                                       │
│                         ▼                                       │
│                    Post-Call Analysis                            │
│                    (transcript + follow-up insights)             │
│                         │                                       │
│                         ▼                                       │
│                    Lead Scoring Dashboard                        │
│                    (engagement tracking via Google Sheets MCP)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 / React 19 / TypeScript |
| **AI Agent** | Claude Agent SDK — multi-turn autonomous agent with tool use |
| **Voice** | ElevenLabs Conversational AI — outbound calls with voice cloning |
| **Tracking** | Google Sheets via MCP — real-time lead scoring and engagement |
| **API Parsing** | swagger-parser — OpenAPI spec validation and endpoint extraction |
| **Email** | Resend — transactional outreach delivery |
| **Styling** | Tailwind CSS — Anthropic-inspired warm design system |

---

## Features

### Autonomous Research Agent

The Claude Agent SDK orchestrates a multi-step research pipeline. Given a prospect URL, it browses their website, identifies business pain points, maps their technology stack, and extracts branding assets — all autonomously via `WebSearch` and `WebFetch` tools.

### Personalized Outreach Generation

Each prospect receives a tailored outreach suite: a sub-4-line cold email mapped to their specific pain points, a branded demo page featuring their logo, a value proposition linking your API endpoints to their problems, a LinkedIn message referencing real details about their company, and a voicemail script for the voice call.

### Voice Calling with Cloned Voice

Outbound calls are placed through ElevenLabs Conversational AI using a cloned founder voice. The system handles voicemail detection automatically — if the prospect doesn't answer, it leaves a personalized voicemail. Dynamic variables inject prospect-specific details into the call script at runtime.

### Post-Call Transcript Analysis

After every call, the system captures the full transcript and generates structured intelligence: key objections raised, interest signals detected, and recommended next steps.

### Real-Time Lead Scoring

Engagement signals are weighted and aggregated across every touchpoint:

| Signal | Weight | Meaning |
|--------|--------|---------|
| Demo page opened | Low | Curiosity |
| Time on page > 2 min | Medium | Interest |
| API playground interaction | High | Intent |
| Voice call delivered | High | Reached |
| Voicemail listened | Very High | Engaged |
| Multiple visits | Very High | Evaluating |

Leads are ranked automatically. Your Google Sheet sorts by engagement score — hottest prospects surface to the top.

### Admin Dashboard

A tracking dashboard shows all prospects, their current scores, outreach status, and call outcomes. Navigate between the upload flow, analysis progress, results view, and engagement tracking from a unified interface.

---

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) package manager
- [Claude CLI](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) installed and authenticated

### Installation

```bash
git clone https://github.com/zackproser/claude-growth-engine.git
cd claude-growth-engine
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required
ANTHROPIC_API_KEY=           # Claude API key for agent orchestration
ELEVENLABS_API_KEY=          # ElevenLabs API key for voice calls
ELEVENLABS_VOICE_ID=         # ID of your cloned voice in ElevenLabs
ELEVENLABS_PHONE_NUMBER_ID=  # Twilio number imported into ElevenLabs

# Optional
DEMO_PHONE_NUMBER=           # Target phone number for demo calls
GOOGLE_SHEET_ID=             # Google Sheets ID for lead tracking
GOOGLE_ACCESS_TOKEN=         # Google Sheets authentication token
```

### Run

```bash
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Upload an OpenAPI spec (there's a sample in `examples/`), enter a target company URL, and let the agent run.

---

## Testing

```bash
pnpm test
```

Runs the Jest test suite covering lead scoring logic, OpenAPI spec parsing, SDK compatibility, and voice call integration.

---

## Project Structure

```
claude-growth-engine/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing / upload page
│   │   ├── upload/page.tsx           # OpenAPI spec upload flow
│   │   ├── target/page.tsx           # Analysis progress UI
│   │   ├── results/page.tsx          # Outreach results view
│   │   ├── tracking/page.tsx         # Lead scoring dashboard
│   │   ├── demo/[id]/page.tsx        # Branded demo pages (per-prospect)
│   │   └── api/
│   │       ├── analyze/route.ts      # SSE endpoint — runs agent pipeline
│   │       ├── validate/route.ts     # OpenAPI spec validation
│   │       ├── voice/route.ts        # Voice call status polling
│   │       ├── scores/route.ts       # Lead score retrieval
│   │       └── track/route.ts        # Engagement event ingestion
│   ├── lib/
│   │   ├── agent.ts                  # Core agent orchestration (Claude Agent SDK)
│   │   ├── voice.ts                  # ElevenLabs voice call placement
│   │   ├── scoring.ts                # Lead scoring engine
│   │   ├── spec-parser.ts            # OpenAPI spec parsing
│   │   ├── sheets.ts                 # Google Sheets MCP integration
│   │   └── types.ts                  # TypeScript type definitions
│   ├── components/
│   │   ├── Navigation.tsx            # App navigation
│   │   └── HottestProspects.tsx      # Top prospects widget
│   └── __tests__/
│       ├── scoring.test.ts           # Lead scoring tests
│       ├── spec-parser.test.ts       # Spec parsing tests
│       ├── sdk-compat.test.ts        # SDK compatibility tests
│       └── voice.test.ts             # Voice integration tests
├── examples/                         # Sample OpenAPI specs
├── artifacts/                        # Generated outreach artifacts
├── img/                              # Logos and flow diagrams
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.ts
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built by [Zack Proser](https://zackproser.com)**

</div>
