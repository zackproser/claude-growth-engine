# How I Built an AI Growth Engine That Turns Any API Into a Sales Pipeline

*A startup founder's outbound problem, solved with the Claude Agent SDK in a weekend.*

---

## The Problem

You've built an API. Your docs are solid. Now you need customers.

But outbound is a grind: researching target companies one by one, reading their sites, figuring out which of your endpoints solve which of their problems, writing personalized emails, building demo pages, tracking who's actually engaged. For a solo founder or a two-person team, this eats 10+ hours a week that should go toward product.

I wanted to see if Claude could do all of that autonomously — and make the output good enough that a founder would actually send it.

## What I Built

**Growth Engine** is a Next.js app powered by the Claude Agent SDK. You give it two inputs:

1. **Your OpenAPI spec** — validated with swagger-parser, so the agent knows exactly what your API does
2. **A target company URL** — who you want to sell to

The agent handles everything else: deep company research via WebSearch + WebFetch, pain point identification through Claude's reasoning, tech stack detection, brand asset discovery, and competitive context analysis. Every action is a real Anthropic API call — no templates, no mail-merge.

### What comes out

A complete, personalized outreach suite:

- **Cold email** — under 4 sentences, referencing the target's specific pain points and the exact endpoints that solve them
- **Branded demo page** — their company name and logo, before/after story blocks showing current pain points vs. API solutions, an interactive API playground with 5 language tabs (cURL, Python, Node.js, Go, Ruby), and a chat widget for questions
- **Value proposition** — a structured breakdown of which API capabilities map to which business problems, with endpoint badges
- **LinkedIn message** — short, specific, referencing something real about their company

### How engagement turns into pipeline

Every interaction on the demo page feeds into a lead scoring engine:

| Signal | Score | What it means |
|--------|-------|---------------|
| Demo page viewed | +10 | Curiosity |
| Time on page > 2 min | +15 | Reading, not bouncing |
| API playground interaction | +20 | Evaluating technical fit |
| Language snippet copied | +25 | "I'm going to try this" |
| Chat question asked | +25 | Active buying signal |
| Feedback submitted | +30 | Telling you their problems |

Repeat engagement gets a bonus. Language preferences are tracked ("this prospect uses Python"). The scoring algorithm produces a temperature rating:

- 🔥 **Hot** (80+): "Schedule a call today — they copied the Python snippet and asked about team pricing"
- 🟡 **Warm** (40-79): "Send the case study in 2 days"
- ❄️ **Cold** (<40): "Re-engage next week with new content"

The tracking page shows all of this in real-time with auto-refresh, and you can export to CSV at any time.

## Technical Decisions

### Why the Claude Agent SDK

The agent needs to do real work: search the web, read websites, reason about what it finds, generate structured output, and optionally write to external services. The Claude Agent SDK provides this as a single `query()` call with tool access baked in:

```typescript
for await (const message of query({
  prompt: buildAgentPrompt(spec, targetUrl),
  options: {
    allowedTools: ['WebSearch', 'WebFetch', 'mcp__google-sheets__*'],
    maxTurns: 10,
    mcpServers: sheetsConfig,
  },
})) {
  // Stream real-time progress to the UI
  emit(extractProgress(message));
}
```

Each tool call becomes a live progress step in the UI — "Searching: WorkOS pricing", "Reading: workos.com/docs", "Analyzing pain points". The user watches the agent work in real-time via SSE streaming, not a fake loading spinner.

### Why MCP for Google Sheets

The tracking data needs to be shareable, exportable, and accessible without a database. Google Sheets via MCP fits perfectly:

- **During analysis**: the agent writes lead data to a "Leads" tab as part of its workflow
- **During demo page usage**: the `/api/track` endpoint writes engagement events to an "Activity" tab via the Sheets API
- **For the founder**: it's a spreadsheet they already know how to use, share with co-founders, and sort/filter

The app works with or without Sheets configured — in-memory storage handles everything locally, with CSV export always available.

### SSE streaming for real progress

The biggest UX improvement was replacing fake loading timers with real agent progress. The `/api/analyze` endpoint returns a Server-Sent Events stream:

```
event: progress
data: {"step": "Searching: WorkOS enterprise auth pricing"}

event: progress
data: {"step": "Reading: workos.com/docs/directory-sync"}

event: progress
data: {"step": "Analyzing pain points and use cases..."}

event: progress
data: {"step": "Assembling outreach suite..."}

event: result
data: { ... full analysis result ... }
```

The target page consumes this stream and renders each step as it arrives — with elapsed time between steps, contextual icons, and a running timer. Every step represents real agent work.

### Demo page as a conversion instrument

The generated demo pages aren't just content — they're instrumented sales tools. Every interaction fires a tracking event:

- **Language tab selection** → "This prospect is a Python shop"
- **Snippet copy** → "They're going to try the API"
- **Time on page** → engagement depth
- **Chat widget questions** → buying signals with exact text
- **Feedback survey** → their priorities in their own words

Each signal feeds the lead scoring engine. A founder checking their tracking page at the end of the day sees a ranked list of prospects with specific next actions — not a generic CRM dashboard.

## The Architecture

```
┌──────────────────────────────────────────────┐
│  Upload Page                                  │
│  Paste OpenAPI spec → swagger-parser → valid  │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  Target Page                                  │
│  Enter company URL → SSE stream → progress UI │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  Claude Agent SDK                             │
│  ├── WebSearch (company research)             │
│  ├── WebFetch (site analysis)                 │
│  └── MCP: google-sheets (lead logging)        │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  Results Page                                 │
│  Cold email · Demo page · Value prop · LinkedIn│
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────┐  ┌────────────────────────────┐
│  Demo Page    │→│  Tracking Page              │
│  (per-target) │  │  Lead scores · Activity feed│
│  Instrumented │  │  CSV export · Auto-refresh  │
└──────────────┘  └────────────────────────────┘
```

**Stack:** Next.js 16, TypeScript, Claude Agent SDK, swagger-parser, Google Sheets MCP, Tailwind CSS.

## What I'd Build Next

- **Resend integration** — one-click to send the cold email directly from the results page
- **Multi-target campaigns** — paste a list of 10 companies, get 10 outreach suites in parallel
- **CRM sync** — push scored leads to HubSpot or Salesforce
- **Slack/email notifications** — "🔥 WorkOS just spent 6 minutes on your demo page and asked about team pricing"
- **A/B test outreach variants** — generate multiple email angles per target, track which converts

## Try It

```bash
git clone https://github.com/zackproser/claude-growth-engine.git
cd claude-growth-engine
pnpm install
echo 'ANTHROPIC_API_KEY=your-key' > .env.local
pnpm dev
```

Open `localhost:3000`. Paste any OpenAPI spec (there's a sample PayFlow API in `examples/`). Pick a target company. Watch Claude work.

**Time to first outreach: under 3 minutes.**

[DEMO VIDEO EMBED HERE]

---

*Built by [Zack Proser](https://zackproser.com). Powered by the Claude Agent SDK.*
