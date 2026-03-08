<div align="center">

<img src="img/claude-logo.svg" alt="Claude" width="56" />

# Claude Growth Engine

**Close prospects faster with an agentic growth engine you can set up in under 3 minutes**

<img src="img/powered-by-claude.svg" alt="Powered by Claude Agent SDK" height="32" />

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Claude Agent SDK](https://img.shields.io/badge/Claude-Agent%20SDK-D97757?style=for-the-badge)](https://platform.claude.com/docs/en/agent-sdk/overview)
[![License: MIT](https://img.shields.io/badge/License-MIT-E8C547?style=for-the-badge)](LICENSE)

<br />

<img src="img/growth-engine-flow.svg" alt="Growth Engine Flow" width="720" />

<br />

**Paste your OpenAPI spec. Pick a target company. Get a personalized outreach suite — instantly.**

[Quick Start](#-quick-start) • [How It Works](#-how-it-works) • [Demo Pages](#-personalized-demo-pages) • [Architecture](#-architecture)

</div>

---

## ⚡ For Startup Founders

You built an API. Now you need to get it in front of the right people — fast. Growth Engine turns your OpenAPI spec into a full outreach machine:

1. **Upload your spec** — JSON or YAML, Claude parses every endpoint
2. **Pick a target company** — just drop their URL
3. **Claude does the research** — scrapes their site, finds their logo, reads their pain points, maps how your API solves them
4. **Get a complete outreach suite** — personalized cold email, a branded demo page, a tailored value prop
5. **Track everything** — engagement, page visits, and feedback logged to Google Sheets

Every interaction flows through the **Claude Agent SDK** → **Anthropic API**. Lean, scrappy, founder-grade infrastructure.

**Time to first outreach: under 3 minutes.**

---

## 🎯 How It Works

### The Agent Pipeline

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  1. UPLOAD SPEC  │────▶│  2. PICK TARGET   │────▶│  3. CLAUDE AGENT   │
│                  │     │                   │     │                    │
│  Paste or upload │     │  Enter company    │     │  Reads your spec   │
│  your OpenAPI    │     │  URL to target    │     │  Scrapes target    │
│  spec (JSON/YAML)│     │                   │     │  Maps pain points  │
└─────────────────┘     └──────────────────┘     └────────┬───────────┘
                                                           │
                    ┌──────────────────────────────────────┘
                    ▼
     ┌──────────────────────────────────┐
     │        YOUR GROWTH SUITE         │
     │                                  │
     │  📧 Cold email (< 4 lines)      │
     │  🎯 Branded demo page per target │
     │  📊 Tailored value proposition   │
     │  📈 Google Sheets tracking       │
     │  🚀 One-click send via Resend    │
     └──────────────────────────────────┘
```

1. **Spec Ingestion** — Parses your OpenAPI spec, extracts endpoints with descriptions, and identifies the core value props of your service
2. **Target Research** — Claude agent browses the target company's website, downloads their logo, reads their tagline, analyzes their tech stack, and identifies specific pain points your API solves
3. **Artifact Generation** — Produces a personalized outreach package:
   - **Cold email** — Under 4 lines, curiosity-driven, with demo link
   - **Demo page** — Branded for the target company with their logo, name, and a "make your first API call in under a minute" experience
   - **Value prop** — Maps their pain points to your endpoints
4. **Tracking** — Page visits, interactions, feedback, and survey responses logged to Google Sheets

---

## 🖥 Personalized Demo Pages

Each target company gets its own branded demo page — generated automatically from your spec + their company data:

- **Company branding** — logo, name, tagline pulled from their site (falls back to clean generic styling)
- **Parameterized per target** — every company you target gets a unique page
- **"Make your first API call"** — interactive walkthrough using your actual endpoints
- **Pain point mapping** — shows how specific endpoints solve their specific problems
- **Feedback capture** — surveys visitors for their biggest pain points (feeds back to Sheets)
- **Activity tracking** — page visits, interactions, and chat messages logged automatically

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/zackproser/claude-growth-engine.git
cd claude-growth-engine

# Install
pnpm install

# Set your Anthropic API key
cp .env.example .env.local
# Edit .env.local with your ANTHROPIC_API_KEY

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any OpenAPI spec to get started.

---

## 🏗 Architecture

```
claude-growth-engine/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── upload/page.tsx       # OpenAPI spec upload + validation
│   │   ├── target/page.tsx       # Target company input
│   │   ├── results/page.tsx      # Generated outreach suite
│   │   └── demo/[id]/page.tsx    # Personalized demo pages (per target)
│   ├── components/
│   │   ├── SpecUploader.tsx      # Upload/paste OpenAPI spec
│   │   ├── TargetAnalyzer.tsx    # Target company research UI
│   │   ├── DemoPage.tsx          # Branded demo page template
│   │   └── OutreachSuite.tsx     # Generated artifacts display
│   ├── lib/
│   │   ├── agent.ts              # Claude Agent SDK + MCP orchestration
│   │   ├── spec-parser.ts        # OpenAPI spec validation & parsing
│   │   └── demo-generator.ts     # Personalized demo page builder
│   └── api/
│       ├── analyze/route.ts      # Agent pipeline API endpoint
│       ├── track/route.ts        # Event tracking → Sheets via MCP
│       └── send/route.ts         # Resend email dispatch
├── .mcp.json                       # MCP server config (google-sheets-mcp)
├── img/
│   ├── claude-logo.svg           # Official Claude logo
│   ├── powered-by-claude.svg     # Powered by Claude badge
│   └── growth-engine-flow.svg    # Architecture diagram
└── README.md
```

### Why Claude Agent SDK + MCP?

The Agent SDK (`@anthropic-ai/claude-agent-sdk`) gives you Claude Code as a library — with built-in tools for web search, web fetch, file operations, and bash. But the real power is **native MCP (Model Context Protocol) support**.

One `query()` call connects the agent to:
- **Built-in tools** — `WebSearch` + `WebFetch` for target company research
- **MCP servers** — `google-sheets-mcp` for tracking, any other MCP server you need

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: `Research ${targetUrl}, find their pain points, 
           generate outreach artifacts, and log to tracking sheet`,
  options: {
    mcpServers: {
      "google-sheets": {
        command: "npx",
        args: ["-y", "google-sheets-mcp"]
      }
    },
    allowedTools: [
      "WebSearch", "WebFetch", "Bash",
      "mcp__google-sheets__*"
    ]
  }
})) {
  console.log(message);
}
```

The agent researches, generates, and tracks — all through the Anthropic API. **Every agent action = API usage = Anthropic revenue.**

---

## 📊 Tracking & Analytics

Growth Engine uses **Google Sheets via MCP** as a lightweight, founder-friendly analytics layer. The Claude agent writes directly to Sheets through the `google-sheets-mcp` server — no custom integration code needed.

| What's Tracked | How |
|---------------|-----|
| Demo page visits | Agent logs via MCP → Sheets |
| API call attempts | Agent logs which endpoints, success/fail |
| Visitor feedback | Survey responses captured, logged to Sheets |
| Chat messages | If visitor engages, logged to Sheets |
| Email opens/clicks | Resend webhooks → API route → Sheets |
| Pain point survey | Agent surveys visitors if pain points not found on site |

No database. No analytics platform. Just a spreadsheet you can share with your co-founder.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS |
| **AI Agent** | Claude Agent SDK + MCP (Anthropic API) |
| **Sheets Tracking** | `google-sheets-mcp` (MCP server) |
| **Email** | Resend |
| **Deployment** | Vercel |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built by [Zack Proser](https://zackproser.com)**

*Close prospects faster. Powered by Claude.*

</div>
