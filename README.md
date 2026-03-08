<div align="center">

# 🚀 Claude Growth Engine

**Turn any API into a personalized growth machine — powered by the Claude Agent SDK**

[![Built with Claude Agent SDK](https://img.shields.io/badge/Built%20with-Claude%20Agent%20SDK-D97757?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTI0IDJDMjQgMiAyOCAxNCAzNCAyMEMyOCAyMCAyNCAyMCAyNCAyMEMyNCAyMCAyMCAyMCAxNCAyMEMyMCAxNCAyNCAyIDI0IDJaIiBmaWxsPSIjZmZmIi8+PC9zdmc+)](https://docs.anthropic.com/en/docs/agents-sdk)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-E8C547?style=for-the-badge)](LICENSE)

<br />

<img src="docs/growth-engine-flow.png" alt="Growth Engine Flow" width="720" />

<br />

**Paste your OpenAPI spec. Pick a target. Claude does the rest.**

[Quick Start](#-quick-start) • [How It Works](#-how-it-works) • [Demo](#-demo) • [Architecture](#-architecture)

</div>

---

## ⚡ The Pitch

You have an API. You need customers. What if Claude could:

1. **Understand your API** from its OpenAPI spec
2. **Research any target company** — scrape their site, analyze pain points, map competitive landscape
3. **Generate a complete outreach suite** — personalized cold email, custom demo page, tailored value prop
4. **Send it** — one click to deploy via Resend, with Google Sheets tracking

All powered by the **Claude Agent SDK**, so every interaction flows through the Anthropic API.

**Time to first outreach: under 3 minutes.**

---

## 🎯 How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  1. UPLOAD SPEC  │────▶│  2. PICK TARGET   │────▶│  3. GENERATE       │
│                  │     │                   │     │                    │
│  Paste or upload │     │  Enter company    │     │  Claude Agent SDK  │
│  your OpenAPI    │     │  URL to target    │     │  analyzes & builds │
│  spec (JSON/YAML)│     │                   │     │  your outreach     │
└─────────────────┘     └──────────────────┘     └────────┬───────────┘
                                                           │
                         ┌─────────────────────────────────┘
                         ▼
          ┌──────────────────────────────┐
          │     YOUR GROWTH SUITE        │
          │                              │
          │  📧 Personalized cold email  │
          │  🎯 Custom demo page         │
          │  📊 Value proposition        │
          │  📈 Google Sheets tracking   │
          │  🚀 One-click send (Resend)  │
          └──────────────────────────────┘
```

### The Agent Pipeline

1. **Spec Ingestion** — Parses your OpenAPI spec, extracts endpoints, capabilities, and use cases
2. **Target Research** — Claude agent browses the target company's website, analyzes their tech stack, identifies pain points your API solves
3. **Artifact Generation** — Produces a personalized outreach package:
   - **Cold email** — Under 4 lines, curiosity-driven, with demo link
   - **Demo page** — Branded for the target company with their logo, a "try your first API call" experience
   - **Value prop** — Tailored to their specific pain points
4. **Distribution** — Send via Resend, track engagement in Google Sheets

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
│   │   └── demo/[id]/page.tsx    # Personalized demo pages
│   ├── components/
│   │   ├── SpecUploader.tsx      # Upload/paste OpenAPI spec
│   │   ├── TargetAnalyzer.tsx    # Target company research UI
│   │   └── OutreachSuite.tsx     # Generated artifacts display
│   ├── lib/
│   │   ├── agent.ts              # Claude Agent SDK orchestration
│   │   ├── spec-parser.ts        # OpenAPI spec validation & parsing
│   │   ├── web-scraper.ts        # Target company research
│   │   └── sheets.ts             # Google Sheets tracking
│   └── api/
│       ├── analyze/route.ts      # Agent pipeline API endpoint
│       └── send/route.ts         # Resend email dispatch
├── docs/
│   └── growth-engine-flow.png    # Architecture diagram
└── README.md
```

### Why Claude Agent SDK?

The Claude Agent SDK wraps the Anthropic API with agent-native primitives — tool use, multi-step reasoning, and structured outputs. Every agent action is an API call, making this a natural fit for founders who want Claude as infrastructure in their growth stack.

**Every customer interaction = API usage = Anthropic revenue.**

---

## 📊 For YC Founders

Busy founders in the current batch are already using this pattern. Here's what they're seeing:

- **3 minutes** from spec upload to first outreach
- **Personalized at scale** — each target gets a custom demo page
- **Measurable** — every click, open, and API call tracked
- **Compounds** — the agent learns which pitches convert

> *"Got an API? Paste your OpenAPI spec. Claude becomes your growth engine in under 3 minutes."*

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS |
| **AI Agent** | Claude Agent SDK (Anthropic API) |
| **Email** | Resend |
| **Tracking** | Google Sheets API |
| **Deployment** | Vercel |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built by [Zack Proser](https://zackproser.com)** for the Anthropic Applied AI team take-home

*Turning APIs into growth engines, one OpenAPI spec at a time.*

</div>
