import { query } from '@anthropic-ai/claude-agent-sdk';
import type { ParsedSpec, CompanyResearch, OutreachArtifact, AnalysisResult } from './types';
import { randomUUID } from 'crypto';

export type ProgressCallback = (phase: { step: string; detail?: string; done?: boolean }) => void;
export type ArtifactCallback = (artifact: OutreachArtifact) => void;

// ============================================================================
// Phase 1: Company Research (WebSearch + WebFetch, ~60-90s)
// ============================================================================

function buildResearchPrompt(spec: ParsedSpec, targetUrl: string): string {
  const endpointSummaries = spec.endpoints
    .slice(0, 15)
    .map(e => `  ${e.method} ${e.path}${e.summary ? ` — ${e.summary}` : ''}`)
    .join('\n');

  return `You are a growth engine agent. Research a target company to prepare for personalized sales outreach.

## The API You're Selling: ${spec.name}
${spec.description ? `Description: ${spec.description}` : ''}
Key endpoints:
${endpointSummaries}

## Your Task
Research ${targetUrl} thoroughly:
- What does the company do? What's their tagline?
- What industry are they in?
- What's their tech stack (if visible)?
- What are their biggest pain points that ${spec.name} could solve? Find at least 3.
- Try to find their logo URL (og:image, apple-touch-icon, or favicon). Don't spend more than one search on this.
- If you find a phone number on their site, include it.

Return ONLY a JSON object with this structure:
\`\`\`json
{
  "name": "Company Name",
  "url": "${targetUrl}",
  "logoUrl": "https://... or null",
  "tagline": "Their tagline",
  "description": "What they do in 1-2 sentences",
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "techStack": ["tech1", "tech2"],
  "industry": "Their industry",
  "phoneNumber": "+1234567890 or null"
}
\`\`\`

IMPORTANT: Return ONLY the JSON object. No markdown fences, no extra text.`;
}

export async function runCompanyResearch(
  spec: ParsedSpec,
  targetUrl: string,
  onProgress?: ProgressCallback
): Promise<CompanyResearch> {
  const emit = onProgress || (() => {});
  emit({ step: 'Spinning up Claude agent...' });

  let resultText = '';
  let lastPhaseTime = Date.now();
  const seenPhases = new Set<string>();

  const emitOnce = (step: string) => {
    if (!seenPhases.has(step)) {
      seenPhases.add(step);
      emit({ step });
      lastPhaseTime = Date.now();
    }
  };

  // Idle narrative for research phase
  const idleNarrative = [
    'Researching company background...',
    'Analyzing their product and market...',
    'Identifying technical pain points...',
    'Studying their competitive landscape...',
  ];
  let idleIdx = 0;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleIdle = () => {
    if (idleIdx >= idleNarrative.length) return;
    idleTimer = setTimeout(() => {
      try {
        if (idleIdx < idleNarrative.length && Date.now() - lastPhaseTime >= 10_000) {
          emit({ step: idleNarrative[idleIdx] });
          idleIdx++;
          lastPhaseTime = Date.now();
        }
        scheduleIdle();
      } catch { /* stop */ }
    }, 12_000 + Math.random() * 8_000);
  };
  scheduleIdle();

  try {
    for await (const message of query({
      prompt: buildResearchPrompt(spec, targetUrl),
      options: {
        allowedTools: ['WebSearch', 'WebFetch'],
        maxTurns: 8,
      },
    })) {
      const msg = message as Record<string, unknown>;

      if (msg.type === 'assistant' && msg.message) {
        const betaMsg = msg.message as { content?: Array<Record<string, unknown>> };
        if (betaMsg.content) {
          for (const block of betaMsg.content) {
            if (block.type === 'tool_use') {
              const toolName = block.name as string;
              if (toolName === 'WebSearch') {
                const input = block.input as Record<string, string> | undefined;
                emitOnce(`Searching: ${input?.query || targetUrl}`);
              } else if (toolName === 'WebFetch') {
                const input = block.input as Record<string, string> | undefined;
                emitOnce(`Reading: ${input?.url || targetUrl}`);
              }
            }
            if (block.type === 'text' && typeof block.text === 'string') {
              const text = block.text as string;
              if (text.includes('"name"') && text.includes('"painPoints"')) {
                resultText = text;
              }
            }
          }
        }
      }

      if (msg.type === 'result' && msg.subtype === 'success') {
        resultText = msg.result as string;
      }

      if (msg.type === 'assistant' && msg.message) {
        const betaMsg = msg.message as { content?: Array<Record<string, unknown>> };
        if (betaMsg.content) {
          for (const block of betaMsg.content) {
            if (block.type === 'text' && typeof block.text === 'string') {
              if ((block.text as string).includes('"painPoints"')) {
                resultText = block.text as string;
              }
            }
          }
        }
      }
    }
  } finally {
    if (idleTimer) clearTimeout(idleTimer);
  }

  if (!resultText) throw new Error('Research agent did not return a result');

  emit({ step: 'Company research complete', done: true });

  let jsonStr = resultText;
  const jsonMatch = resultText.match(/\{[\s\S]*"name"[\s\S]*"painPoints"[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  try {
    return JSON.parse(jsonStr) as CompanyResearch;
  } catch {
    throw new Error('Failed to parse company research. Raw: ' + resultText.slice(0, 300));
  }
}

// ============================================================================
// Phase 2: Parallel Artifact Generation (no tools, ~15-20s each)
// ============================================================================

interface ArtifactSpec {
  type: OutreachArtifact['type'];
  title: string;
  prompt: string;
}

function buildArtifactSpecs(spec: ParsedSpec, company: CompanyResearch): ArtifactSpec[] {
  const endpointSummaries = spec.endpoints
    .slice(0, 15)
    .map(e => `${e.method} ${e.path}${e.summary ? ` — ${e.summary}` : ''}`)
    .join('\n');

  const companyContext = `Company: ${company.name}
Description: ${company.description || 'N/A'}
Industry: ${company.industry || 'N/A'}
Pain Points: ${company.painPoints.join('; ')}
Tech Stack: ${(company.techStack || []).join(', ') || 'Unknown'}`;

  const apiContext = `API: ${spec.name}
${spec.description || ''}
Endpoints:
${endpointSummaries}`;

  return [
    {
      type: 'cold-email',
      title: 'Cold Email',
      prompt: `Write a cold sales email for ${company.name}.

${companyContext}

${apiContext}

Requirements:
- Under 4 lines
- Curiosity-driven hook about their peers
- Reference a specific pain point you see above
- End with a CTA for a 5-minute call
- Return ONLY the email text, nothing else.`,
    },
    {
      type: 'linkedin-message',
      title: 'LinkedIn Message',
      prompt: `Write a LinkedIn connection message for someone at ${company.name}.

${companyContext}

Requirements:
- Under 3 sentences
- Reference something specific about their company from the context above
- Return ONLY the message text, nothing else.`,
    },
    {
      type: 'value-prop',
      title: 'Value Proposition',
      prompt: `Create 4-6 value proposition cards mapping ${spec.name} endpoints to ${company.name}'s pain points.

${companyContext}

${apiContext}

Return a JSON array (no markdown, no wrapping): [{"headline": "Short title under 70 chars", "body": "2-3 sentences explaining how this endpoint solves their problem", "endpoint": "POST /path"}]

Return ONLY the JSON array.`,
    },
    {
      type: 'demo-page',
      title: 'Personalized Demo Page Content',
      prompt: `Create 3-5 story blocks for a personalized demo page showing how ${spec.name} transforms ${company.name}.

${companyContext}

${apiContext}

Each block interleaves a pain point with an API solution. Return a JSON array:
[{"painPoint": "...", "solution": "...", "endpointPath": "/path", "endpointMethod": "POST", "exampleRequest": "curl ...", "exampleResponse": "{...}"}]

Return ONLY the JSON array.`,
    },
    {
      type: 'voicemail-script',
      title: 'Call Script',
      prompt: `Write a natural sales call opening pitch (15-25 seconds when spoken) as if a founder is personally calling ${company.name}.

${companyContext}

${apiContext}

Requirements:
- Reference the company by name
- Mention ONE specific pain point and how ${spec.name} helps
- End with a soft CTA like "check your email for a quick demo link"
- Sound natural and conversational, NOT salesy or robotic
- No "Hi, my name is..." opener — jump straight in
- Return ONLY the script text, nothing else.

After the script, on a new line starting with "REASONING:", add 2-3 sentences explaining which pain point you chose and why.`,
    },
  ];
}

async function generateSingleArtifact(
  artifactSpec: ArtifactSpec,
): Promise<OutreachArtifact & { reasoning?: string }> {
  let resultText = '';

  for await (const message of query({
    prompt: artifactSpec.prompt,
    options: {
      allowedTools: [],
      maxTurns: 1,
    },
  })) {
    const msg = message as Record<string, unknown>;
    if (msg.type === 'result' && msg.subtype === 'success') {
      resultText = msg.result as string;
    }
    if (msg.type === 'assistant' && msg.message) {
      const betaMsg = msg.message as { content?: Array<Record<string, unknown>> };
      if (betaMsg.content) {
        for (const block of betaMsg.content) {
          if (block.type === 'text' && typeof block.text === 'string') {
            resultText = block.text as string;
          }
        }
      }
    }
  }

  if (!resultText) {
    return { type: artifactSpec.type, title: artifactSpec.title, content: `Failed to generate ${artifactSpec.title}` };
  }

  // For voicemail, split script from reasoning
  let content = resultText.trim();
  let reasoning: string | undefined;
  if (artifactSpec.type === 'voicemail-script' && content.includes('REASONING:')) {
    const parts = content.split('REASONING:');
    content = parts[0].trim();
    reasoning = parts[1]?.trim();
  }

  return { type: artifactSpec.type, title: artifactSpec.title, content, reasoning };
}

export async function generateAllArtifacts(
  spec: ParsedSpec,
  company: CompanyResearch,
  onArtifactReady?: ArtifactCallback
): Promise<{ artifacts: OutreachArtifact[]; voicemailReasoning?: string }> {
  const artifactSpecs = buildArtifactSpecs(spec, company);
  let voicemailReasoning: string | undefined;

  const results = await Promise.allSettled(
    artifactSpecs.map(async (as) => {
      const result = await generateSingleArtifact(as);
      if (result.reasoning) voicemailReasoning = result.reasoning;
      const artifact: OutreachArtifact = { type: result.type, title: result.title, content: result.content };
      onArtifactReady?.(artifact);
      return artifact;
    })
  );

  const artifacts = results
    .filter((r): r is PromiseFulfilledResult<OutreachArtifact> => r.status === 'fulfilled')
    .map(r => r.value);

  return { artifacts, voicemailReasoning };
}

// ============================================================================
// Combined: Two-phase pipeline
// ============================================================================

export async function runGrowthAgent(
  spec: ParsedSpec,
  targetUrl: string,
  onProgress?: ProgressCallback,
  onArtifactReady?: ArtifactCallback
): Promise<AnalysisResult> {
  const id = randomUUID();

  // Phase 1: Research
  const company = await runCompanyResearch(spec, targetUrl, onProgress);

  // Emit phase transition
  onProgress?.({ step: 'Generating personalized outreach...', detail: 'Creating 5 artifacts in parallel' });

  // Phase 2: Parallel artifact generation
  const { artifacts, voicemailReasoning } = await generateAllArtifacts(spec, company, onArtifactReady);

  onProgress?.({ step: 'Done — outreach suite ready', done: true });

  return {
    id,
    createdAt: new Date().toISOString(),
    spec,
    company,
    artifacts,
    demoPageUrl: `/demo/${id}`,
    voicemailReasoning,
  };
}
