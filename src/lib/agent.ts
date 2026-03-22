import { query } from '@anthropic-ai/claude-agent-sdk';
import type { ParsedSpec, CompanyResearch, OutreachArtifact, AnalysisResult } from './types';
import { randomUUID } from 'crypto';

export type ProgressCallback = (phase: { step: string; detail?: string; done?: boolean }) => void;

function buildAgentPrompt(spec: ParsedSpec, targetUrl: string, sheetId?: string): string {
  const endpointSummaries = spec.endpoints
    .slice(0, 20)
    .map(e => `  ${e.method} ${e.path}${e.summary ? ` — ${e.summary}` : ''}${e.description ? ` (${e.description})` : ''}`)
    .join('\n');

  const sheetsInstructions = sheetId ? `

## Step 3: Log to Google Sheets
After generating all artifacts, write a summary row to the Google Sheet (ID: ${sheetId}).
Use the MCP google-sheets tools to:
1. Find or create a sheet tab called "Leads"
2. Append a row with columns: [Timestamp, Company Name, Company URL, Industry, Pain Points (comma-separated), Lead Score, Artifacts Generated, Demo Page URL]
3. Use the current ISO timestamp
4. Set initial lead score to 50 (baseline — will increase with engagement)
` : '';

  return `You are a growth engine agent for startup founders. Your job is to research a target company and generate a personalized outreach suite based on the founder's API.

## The Founder's API: ${spec.name}
${spec.description ? `Description: ${spec.description}` : ''}
${spec.baseUrl ? `Base URL: ${spec.baseUrl}` : ''}
Version: ${spec.version}
Endpoints (${spec.endpointCount} total):
${endpointSummaries}

## Your Task

### Step 1: Research the target company
Go to ${targetUrl} and research everything you can about them:
- What does the company do? What's their tagline?
- What industry are they in?
- What's their tech stack (if visible)?
- What are their biggest pain points that the founder's API could solve?
- Try to find their logo URL from the site's og:image meta tag, apple-touch-icon, or /favicon.ico. If not immediately obvious, use their favicon or set logoUrl to null. Do NOT spend multiple searches looking for a logo — move on quickly.
- Look for any indicators of their current technical challenges
- If you find a phone number on their website (contact page, footer, etc.), include it as "phoneNumber" in the company object

### Step 2: Generate outreach artifacts
Based on your research, create the following. Each must be deeply personalized to the target company — reference their specific products, pain points, and how specific API endpoints solve their problems.
${sheetsInstructions}
Return your findings as a JSON object with this exact structure:
\`\`\`json
{
  "company": {
    "name": "Company Name",
    "url": "${targetUrl}",
    "logoUrl": "https://...",
    "tagline": "Their tagline",
    "description": "What they do in 1-2 sentences",
    "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
    "techStack": ["tech1", "tech2"],
    "industry": "Their industry",
    "phoneNumber": "+1234567890 or null if not found"
  },
  "artifacts": [
    {
      "type": "cold-email",
      "title": "Cold Email",
      "content": "The full email text. Under 4 lines. Curiosity-driven. Include a hook about their peers. Reference a specific pain point you found. End with a CTA for a 5-minute call."
    },
    {
      "type": "value-prop",
      "title": "Value Proposition",
      "content": "A JSON array of 4-6 value proposition cards, each mapping a specific API endpoint to a specific pain point of the target company. Format: [{\"headline\": \"Short punchy title under 70 chars\", \"body\": \"2-3 sentences explaining how this endpoint solves their specific problem — be concrete, reference their actual business\", \"endpoint\": \"POST /path/to/endpoint\"}]. Return ONLY the JSON array as the content string, no markdown, no wrapping object."
    },
    {
      "type": "demo-page",
      "title": "Personalized Demo Page Content",
      "content": "A JSON array of 3-5 'story blocks' that interleave pain points with API solutions. Each block has: painPoint (the before), solution (the after — how the API fixes it), endpointPath (the specific endpoint), endpointMethod (GET/POST/etc), exampleRequest (a curl or code snippet showing the call), exampleResponse (a realistic JSON response). Format as a JSON array: [{\\"painPoint\\": \\"...\\", \\"solution\\": \\"...\\", \\"endpointPath\\": \\"/path\\", \\"endpointMethod\\": \\"POST\\", \\"exampleRequest\\": \\"curl ...\\", \\"exampleResponse\\": \\"{...}\\"}]. This creates a technical narrative: problem → solution → proof."
    },
    {
      "type": "linkedin-message",
      "title": "LinkedIn Message",
      "content": "A short LinkedIn connection message. Under 3 sentences. Reference something specific about their company."
    },
    {
      "type": "voicemail-script",
      "title": "Voicemail Script",
      "content": "A natural, conversational voicemail script (15-25 seconds when spoken). Written as if a founder is personally calling. Reference the company by name, mention ONE specific pain point you found, and briefly say how the API helps. End with your name and a soft CTA like 'I'd love to show you — check your email for a quick demo link.' Do NOT sound salesy or robotic. No 'Hi, my name is...' opener — jump straight in like you know them."
    }
  ],
  "voicemailReasoning": "2-3 sentences explaining: which pain point you chose to lead with in the voicemail and why, what tone you're going for, and why this approach will resonate with this specific company."
}
\`\`\`

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text before or after.`;
}

export async function runGrowthAgent(
  spec: ParsedSpec,
  targetUrl: string,
  onProgress?: ProgressCallback
): Promise<AnalysisResult> {
  const id = randomUUID();
  let resultText = '';

  const emit = onProgress || (() => {});
  emit({ step: 'Spinning up Claude agent and configuring tools...' });

  // Build MCP servers config — include google-sheets if configured
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const hasSheets = Boolean(process.env.GOOGLE_ACCESS_TOKEN && sheetId);

  const mcpServers = hasSheets ? {
    'google-sheets': {
      command: 'npx' as string,
      args: ['-y', 'google-sheets-mcp'] as string[],
      env: {
        GOOGLE_ACCESS_TOKEN: process.env.GOOGLE_ACCESS_TOKEN!,
      } as Record<string, string>,
    },
  } : undefined;

  const allowedTools = ['WebSearch', 'WebFetch'];
  if (hasSheets) {
    allowedTools.push('mcp__google-sheets__*');
  }

  // Track which tools the agent uses for real progress updates
  const seenPhases = new Set<string>();
  const emitOnce = (step: string, detail?: string) => {
    if (!seenPhases.has(step)) {
      seenPhases.add(step);
      emit({ step, detail });
      lastPhaseTime = Date.now();
    }
  };

  // Time-based fallback: if no phase emitted in 15s, show a "still working" message
  let lastPhaseTime = Date.now();
  const idleMessages = [
    'Deep-diving into their tech stack...',
    'Crafting personalized hooks...',
    'Analyzing competitive positioning...',
    'Cross-referencing API capabilities...',
    'Evaluating market fit signals...',
    'Studying their product landscape...',
  ];
  let idleMessageIndex = 0;
  const idleInterval = setInterval(() => {
    try {
      if (Date.now() - lastPhaseTime >= 15_000) {
        const msg = idleMessages[idleMessageIndex % idleMessages.length];
        idleMessageIndex++;
        emit({ step: msg });
        lastPhaseTime = Date.now();
      }
    } catch {
      clearInterval(idleInterval);
    }
  }, 5_000);

  try {
  for await (const message of query({
    prompt: buildAgentPrompt(spec, targetUrl, sheetId),
    options: {
      allowedTools,
      maxTurns: 10,
      ...(mcpServers ? { mcpServers } : {}),
    },
  })) {
    const msg = message as Record<string, unknown>;

    // Detect real tool use from assistant messages for progress
    if (msg.type === 'assistant' && msg.message) {
      const betaMsg = msg.message as { content?: Array<Record<string, unknown>> };
      if (betaMsg.content) {
        for (const block of betaMsg.content) {
          if (block.type === 'tool_use') {
            const toolName = block.name as string;
            if (toolName === 'WebSearch') {
              const input = block.input as Record<string, string> | undefined;
              emitOnce('web_search', `Searching: ${input?.query || targetUrl}`);
            } else if (toolName === 'WebFetch') {
              const input = block.input as Record<string, string> | undefined;
              emitOnce('web_fetch', `Reading: ${input?.url || targetUrl}`);
            } else if (toolName?.startsWith('mcp__google-sheets')) {
              emitOnce('sheets_write', 'Writing lead data to Google Sheets...');
            }
          }
          if (block.type === 'text' && typeof block.text === 'string') {
            const text = block.text as string;
            const lower = text.toLowerCase();
            // Detect phase from agent's text output
            if (text.includes('"company"') && text.includes('"artifacts"')) {
              emitOnce('assembling', 'Assembling outreach suite...');
              resultText = text;
            } else if (lower.includes('logo') || lower.includes('brand')) {
              emitOnce('branding', 'Finding company branding...');
            }
            // Granular phase detection from agent reasoning
            if (lower.includes('research') || lower.includes('found') || lower.includes('company') || lower.includes('website')) {
              emitOnce('company_profile', 'Analyzing company profile...');
            }
            if (lower.includes('pain') || lower.includes('challenge') || lower.includes('problem') || lower.includes('struggle')) {
              emitOnce('pain_points', 'Identifying pain points...');
            }
            if (lower.includes('email') || lower.includes('subject line') || lower.includes('cold email')) {
              emitOnce('cold_email', 'Crafting cold email...');
            }
            if (lower.includes('value prop') || lower.includes('endpoint') || lower.includes('api') || lower.includes('mapping')) {
              emitOnce('value_props', 'Mapping API endpoints to pain points...');
            }
            if (lower.includes('demo') || lower.includes('story block') || lower.includes('narrative')) {
              emitOnce('demo_page', 'Building personalized demo page...');
            }
            if (lower.includes('linkedin') || lower.includes('connection')) {
              emitOnce('linkedin', 'Writing LinkedIn message...');
            }
            if (lower.includes('voicemail') || lower.includes('voice') || lower.includes('script') || lower.includes('call')) {
              emitOnce('voicemail', 'Writing voicemail script...');
            }
          }
        }
      }
    }

    // Tool use summary messages — great for progress
    if (msg.type === 'tool_use_summary') {
      const summary = msg.summary as string;
      emit({ step: summary });
    }

    // Capture result
    if (msg.type === 'result' && msg.subtype === 'success') {
      resultText = msg.result as string;
      emit({ step: 'Agent complete', done: true });
    }

    // Also capture from assistant text blocks
    if (msg.type === 'assistant' && msg.message) {
      const betaMsg = msg.message as { content?: Array<Record<string, unknown>> };
      if (betaMsg.content) {
        for (const block of betaMsg.content) {
          if (block.type === 'text' && typeof block.text === 'string') {
            if ((block.text as string).includes('"company"') && (block.text as string).includes('"artifacts"')) {
              resultText = block.text as string;
            }
          }
        }
      }
    }
  }
  } finally {
    clearInterval(idleInterval);
  }

  if (!resultText) {
    throw new Error('Agent did not return a result');
  }

  emit({ step: 'Parsing agent response...', done: false });

  // Extract JSON from the result
  let jsonStr = resultText;
  const jsonMatch = resultText.match(/\{[\s\S]*"company"[\s\S]*"artifacts"[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  let agentResult: { company: CompanyResearch; artifacts: OutreachArtifact[]; voicemailReasoning?: string };
  try {
    agentResult = JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse agent response as JSON. Raw: ' + resultText.slice(0, 500));
  }

  emit({ step: 'Done — outreach suite ready', done: true });

  return {
    id,
    createdAt: new Date().toISOString(),
    spec,
    company: agentResult.company,
    artifacts: agentResult.artifacts,
    demoPageUrl: `/demo/${id}`,
    voicemailReasoning: agentResult.voicemailReasoning,
  };
}
