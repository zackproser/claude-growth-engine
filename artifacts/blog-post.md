# How Claude Turns Your API Into a Growth Engine (In Under 3 Minutes)

*A practical guide for startup founders who'd rather build product than write cold emails.*

---

## The Problem Every YC Founder Hits

You've built an API. It's good. Your docs are solid. Demo Day is coming — or it just passed — and now you need to get your first 10 customers. Fast.

But outbound is a grind. You're Googling target companies, skimming their sites for pain points, writing personalized emails one at a time, building demo pages, tracking who's actually engaged. It eats 10+ hours a week that should go toward product.

What if an AI agent could do all of that in 3 minutes?

## What Growth Engine Does

Growth Engine is a Next.js app powered by the **Claude Agent SDK**. You give it two things:

1. **Your OpenAPI spec** — the source of truth for what your API does
2. **A target company URL** — who you want to sell to

Claude takes it from there:

- **Researches the target** — visits their site, reads their copy, identifies their tech stack, maps their pain points
- **Generates a complete outreach suite:**
  - A **cold email** under 4 sentences, personalized to their specific problems
  - A **branded demo page** with their logo, a "make your first API call" walkthrough, and pain-point-to-endpoint mapping
  - A **value proposition** that connects your endpoints to their needs
  - A **LinkedIn message** for the decision maker
- **Scores and ranks your leads** — tracks demo page engagement (time on page, interactions, feedback) and surfaces the hottest prospects at the top of your sheet
- **Tells you when to follow up** — engagement signals drive re-engagement timing recommendations

Every action flows through the Anthropic API via the Claude Agent SDK. The tracking layer writes to Google Sheets via MCP — no database, no analytics platform, just a spreadsheet you can share with your co-founder.

## Why This Matters for YC Founders

### Time to value is everything

YC partners evaluate traction. Investors want to see pipeline. The faster you can show that real companies are engaging with your product, the stronger your story.

Growth Engine compresses what used to take a full-time SDR a week into a 3-minute automated workflow. You paste your spec, pick your targets, and the agent does the rest.

### Personalization at scale without the headcount

The demo pages aren't generic. Each target company gets their own branded page with:
- Their company name and logo
- A walkthrough of the 2-3 endpoints most relevant to their pain points
- An interactive "try your first API call" experience
- A feedback survey that captures their biggest challenges

When a prospect spends 4 minutes on their demo page, interacts with the API playground, and submits feedback — they shoot to the top of your lead list as **highly engaged**. The sheet tells you exactly when to reach out.

### Agentic workflows > manual hustle

The Claude Agent SDK gives the agent real tools: web search, web fetch, file operations, and MCP server connections. It's not a prompt-and-pray chatbot — it's an autonomous research agent that does genuine work.

The agent:
1. Searches the web for the target company
2. Fetches and analyzes their website
3. Cross-references their pain points against your API endpoints
4. Generates artifacts with structured output
5. Logs everything to Sheets via MCP

Every step is an API call. Every API call is Anthropic revenue. The more founders use this, the more the platform grows.

## The Architecture

```
OpenAPI Spec + Target URL
        ↓
  Claude Agent SDK
  ├── WebSearch (research target)
  ├── WebFetch (scrape their site)
  └── MCP: google-sheets (tracking)
        ↓
  Outreach Suite
  ├── Cold email
  ├── Branded demo page
  ├── Value proposition
  └── LinkedIn message
        ↓
  Lead Scoring Sheet
  ├── Engagement signals
  ├── Lead temperature (🔥 hot → ❄️ cold)
  └── Re-engagement timing
```

**Tech stack:** Next.js, TypeScript, Claude Agent SDK, Google Sheets MCP, Resend.

## Lead Scoring: How It Works

Not all prospects are equal. Growth Engine automatically ranks leads based on real engagement signals:

| Signal | Weight | What It Means |
|--------|--------|---------------|
| Demo page opened | Low | Curiosity — they clicked |
| Time on page > 2 min | Medium | Interest — they're reading |
| API playground interaction | High | Intent — they're trying it |
| Feedback survey submitted | Very High | Engaged — they told you their problems |
| Multiple visits | Very High | Returning — they're evaluating |

The Google Sheet auto-sorts by engagement score. The hottest leads float to the top. A "next action" column tells you when and how to follow up:

- 🔥 **Hot** (score > 80): "Follow up today — they spent 4 min on the demo and tried 3 endpoints"
- 🟡 **Warm** (score 40-80): "Send the case study in 2 days"
- ❄️ **Cold** (score < 40): "Re-engage in a week with new content"

## Try It

```bash
git clone https://github.com/zackproser/claude-growth-engine.git
cd claude-growth-engine
pnpm install
echo 'ANTHROPIC_API_KEY=your-key' > .env.local
pnpm dev
```

Open `localhost:3000`. Paste any OpenAPI spec — there's a sample PayFlow API in `examples/` if you want to test. Pick a target company. Watch Claude work.

**Time to first outreach: under 3 minutes.**

## What's Next

- **Resend integration** — one click to send the cold email directly
- **Multi-target campaigns** — paste a list of 10 companies, get 10 outreach suites
- **CRM sync** — push scored leads to HubSpot/Salesforce
- **Slack notifications** — "🔥 Acme Corp just spent 6 minutes on your demo page"

---

*Built by [Zack Proser](https://zackproser.com). Powered by the Claude Agent SDK.*

*Got an API? [Try it now](https://github.com/zackproser/claude-growth-engine).*
