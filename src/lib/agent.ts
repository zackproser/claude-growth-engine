import { query } from '@anthropic-ai/claude-agent-sdk';
import type { ParsedSpec, CompanyResearch, OutreachArtifact, AnalysisResult } from './types';
import { randomUUID } from 'crypto';

function buildAgentPrompt(spec: ParsedSpec, targetUrl: string): string {
  const endpointSummaries = spec.endpoints
    .slice(0, 20)
    .map(e => `  ${e.method} ${e.path}${e.summary ? ` — ${e.summary}` : ''}${e.description ? ` (${e.description})` : ''}`)
    .join('\n');

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
      "content": "A JSON array of 3-5 'story blocks' that interleave pain points with API solutions. Each block has: painPoint (the before), solution (the after — how the API fixes it), endpointPath (the specific endpoint), endpointMethod (GET/POST/etc), exampleRequest (a curl or code snippet showing the call), exampleResponse (a realistic JSON response). Format as a JSON array: [{\"painPoint\": \"...\", \"solution\": \"...\", \"endpointPath\": \"/path\", \"endpointMethod\": \"POST\", \"exampleRequest\": \"curl ...\", \"exampleResponse\": \"{...}\"}]. This creates a technical narrative: problem → solution → proof."
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
  targetUrl: string
): Promise<AnalysisResult> {
  const id = randomUUID();
  let resultText = '';

  for await (const message of query({
    prompt: buildAgentPrompt(spec, targetUrl),
    options: {
      allowedTools: ['WebSearch', 'WebFetch'],
      maxTurns: 15,
    },
  })) {
    // Collect the result text from the agent
    const msg = message as Record<string, unknown>;
    if (msg.type === 'result' && msg.subtype === 'success') {
      resultText = msg.result as string;
    }
    // Also capture assistant messages that contain the JSON
    if (msg.type === 'assistant' && msg.content) {
      const content = msg.content as Array<Record<string, unknown>>;
      for (const block of content) {
        if (block.type === 'text' && typeof block.text === 'string') {
          // Check if this block contains our JSON result
          if (block.text.includes('"company"') && block.text.includes('"artifacts"')) {
            resultText = block.text;
          }
        }
      }
    }
  }

  if (!resultText) {
    throw new Error('Agent did not return a result');
  }

  // Extract JSON from the result (handle potential markdown fences)
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

  return {
    id,
    createdAt: new Date().toISOString(),
    spec,
    company: agentResult.company,
    artifacts: agentResult.artifacts,
    demoPageUrl: `/demo/${id}`,
  };
}
