# Demo Script — Claude Growth Engine (20 min + 10 min Q&A)

## 1. Opening Framing (2-3 min)
**Slide: Intro with pixel art avatar**

- "I'm Zack Proser — 14 years full stack, currently on the Applied AI team at WorkOS, building with Claude for 3 years."
- Set the scene: "Imagine you're a founder. You've built a payments API. You need early customers. You're doing everything manually — researching prospects, writing cold emails, building demo pages, making calls. What if your growth operation was autonomous?"
- "I built this in a weekend with the Claude Agent SDK. Let me show you what it does."

## 2. Upload Spec (1 min)
**Show: Upload page → PayFlow API spec**

- "This is a real OpenAPI spec — 21 endpoints for a Stripe-like payments platform."
- Don't rush — let them see the endpoint list
- "I drop in a target company URL and the agent takes over."

## 3. Research Phase (1.5 min)
**Show: Analysis page with Claude spinner + progress steps**

- Narrate the steps as they appear: "It's searching the web... reading their site... identifying pain points..."
- "Every step is a real Anthropic API call — the agent is autonomously deciding what to research."
- Point out the research phase timing: "About 60 seconds for deep research — faster than any human SDR."

## 4. Results Page — Artifacts (3-4 min)
**Show: Results page with skeleton cards → artifacts filling in**

- "Now watch — five artifacts generating in parallel."
- As each appears, narrate:
  - **Cold email**: Read it out loud. "Notice it references their actual business, their actual pain points."
  - **Value props**: "Each card maps a specific API endpoint to a specific problem they have."
  - **Demo page**: Click through. "A fully branded demo page, personalized to their stack."
  - **LinkedIn message**: "Three sentences, references something specific."
  - **Voicemail script**: "And this — this is what the AI is about to say when it calls them. In my voice."

## 5. THE CALL — Showstopper (3-4 min)
**Setup + Call + Aftermath**

- Setup (30s): "Now watch — I'm going to hit this button and it's going to call my phone. It's going to speak in my cloned voice and pitch PayFlow based on everything it just learned."
- Hit "Place Call" — phone rings on speaker
- Take the call (1 min): Let the room hear the AI delivering the pitch in your voice. Push back with an objection. Let it handle it.
- Hang up (30s): "That just happened. An AI agent researched a company, wrote a personalized pitch, and called them — all autonomously."
- Wait for transcript (30s): "Now watch the dashboard — it's pulling the transcript and analyzing the conversation."
- Show transcript + insights (1 min): "It captured everything we said. And look — it found TWO new pain points from the conversation that weren't on their website. It's recommending follow-up actions."
- Show tracking update: "And the lead score just jumped. This prospect is now a hot lead."

## 6. Demo Page Walkthrough (1.5 min)
**Show: /demo/[id] page**

- "Let me show you what the prospect sees when they click the demo link."
- Scroll through the pain point → solution cards
- Show the API playground: "They can try the API right here — we track which language they pick."
- "Every interaction on this page feeds back into the lead score."

## 7. Tracking Dashboard (1 min)
**Show: /tracking page**

- Click through all three tabs: Lead Scores, Activity Feed, Agent Log
- "This is your command center. Every signal — page views, API playground clicks, the voice call — it all feeds into one score."

## 8. Architecture Slide (2 min)
**Slide: How it works under the hood**

- Show the architecture diagram
- "Here's what just happened: The Claude Agent SDK orchestrated this entire pipeline."
- Explain the agent loop: "It chose which tools to use — WebSearch, WebFetch — decided what to research, structured the output, and generated five artifacts in parallel."
- "This is the agentic pattern — the AI isn't just answering questions. It's making decisions, using tools, and taking actions."
- Plug the SDK: "All of this is the Claude Agent SDK. It's open, it's documented, and you can build this."

## 9. Live Feature Request + Plan Mode (3-4 min)
**Live coding segment**

- "So what would you build next? What would make this even more powerful for YOUR business?"
- Take a suggestion from the audience
- Open Claude Code, dictate via Wispr Flow: "Add [feature they suggested]"
- Show Claude reasoning through the architecture in plan mode
- "This is what building with Claude looks like — I describe what I want, it reasons through the implementation, and I review the plan."
- Don't need to actually implement — just show the planning

## 10. Close (1 min)
- "I built this entire system in a weekend. The Agent SDK handles the complexity — tool use, multi-turn reasoning, autonomous decisions."
- "What would YOU build with autonomous agents?"
- "I'm Zack — find me after if you want to talk about agentic patterns."

---

## Timing Summary
| Section | Duration | Running Total |
|---------|----------|---------------|
| Opening framing | 2-3 min | 2-3 min |
| Upload spec | 1 min | 3-4 min |
| Research phase | 1.5 min | 4.5-5.5 min |
| Results + artifacts | 3-4 min | 7.5-9.5 min |
| THE CALL | 3-4 min | 10.5-13.5 min |
| Demo page | 1.5 min | 12-15 min |
| Tracking dashboard | 1 min | 13-16 min |
| Architecture slide | 2 min | 15-18 min |
| Live feature request | 3-4 min | 18-22 min |
| Close | 1 min | 19-23 min |

**Target: 20 minutes → Q&A fills to 30**

## Key Reminders
- SLOW DOWN. Talk to the room, not the screen.
- Pause after the call. Let them absorb it.
- Read the cold email out loud.
- React to what the agent finds — "Oh interesting, it picked up on their consulting practice."
- The call is the climax. Everything before builds to it. Everything after analyzes it.
