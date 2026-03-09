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
- IMPORTANT: Find their logo URL. Search for "${targetUrl} logo" or look at their site's og:image meta tag, apple-touch-icon, or /favicon.ico. Also try common paths like /logo.svg, /logo.png. Use WebSearch to find "[company name] logo png" if not found on their site. The logoUrl MUST be a full https:// URL to an actual image file.
- Look for any indicators of their current technical challenges

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
    "industry": "Their industry"
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
      "content": "A compelling value prop that maps SPECIFIC API endpoints to SPECIFIC pain points of the target company. Show them exactly which endpoints solve which problems. Include 'make your first API call in under a minute' messaging."
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
    }
  ]
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
  emit({ step: 'Initializing Claude Agent SDK...' });

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
    }
  };

  for await (const message of query({
    prompt: buildAgentPrompt(spec, targetUrl, sheetId),
    options: {
      allowedTools,
      maxTurns: 15,
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
            // Detect phase from agent's text output
            if (text.includes('"company"') && text.includes('"artifacts"')) {
              emitOnce('generating', 'Assembling outreach suite...');
              resultText = text;
            } else if (text.includes('pain') || text.includes('challenge')) {
              emitOnce('analyzing', 'Analyzing pain points and use cases...');
            } else if (text.includes('logo') || text.includes('brand')) {
              emitOnce('branding', 'Finding company branding...');
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

  let agentResult: { company: CompanyResearch; artifacts: OutreachArtifact[] };
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
  };
}
