import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { VoiceCallResult, VoiceCallStatus, CallTranscriptEntry } from './types';

// In-memory stores
const voiceCallStore = new Map<string, VoiceCallResult>();
const agentDecisionsStore = new Map<string, string[]>();

function getClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');
  return new ElevenLabsClient({ apiKey });
}

import type { TrackingEvent } from './types';

function trackVoiceEvent(resultId: string, companyUrl: string, eventType: TrackingEvent['eventType'], metadata?: Record<string, string>) {
  // POST to the track API to ensure events land in the same store the dashboard reads
  fetch('http://localhost:3000/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultId, companyUrl, eventType, metadata }),
  }).catch(err => console.error('[Voice] Track event failed:', err));
}

export function isVoiceConfigured(): boolean {
  return Boolean(
    process.env.ELEVENLABS_API_KEY &&
    process.env.ELEVENLABS_VOICE_ID &&
    process.env.ELEVENLABS_PHONE_NUMBER_ID &&
    process.env.DEMO_PHONE_NUMBER
  );
}

/**
 * Create a fresh ElevenLabs Conversational AI agent for this call.
 * Configured for live conversation — delivers the pitch, handles objections,
 * probes for additional pain points.
 */
async function createAgentForCall(script: string, productContext?: string): Promise<string> {
  const client = getClient();
  const voiceId = process.env.ELEVENLABS_VOICE_ID!;

  const response = await client.conversationalAi.agents.create({
    name: 'Growth Engine Sales Agent',
    platformSettings: {
      overrides: {
        conversationConfigOverride: {
          agent: {
            firstMessage: true,
          },
          tts: {
            voiceId: true,
          },
        },
      },
    },
    conversationConfig: {
      tts: {
        voiceId,
      },
      agent: {
        firstMessage: script,
        language: 'en',
        prompt: {
          prompt: `You are a startup founder making a personalized sales call to a potential customer. You just delivered your opening pitch (the first message). Now engage in natural conversation.

${productContext ? `YOUR PRODUCT:
${productContext}

CRITICAL: Only reference features and capabilities described above. Do NOT make up features, describe services not listed, or guess what the product does. If asked about something not covered above, say "I'd love to walk you through that on a demo call" and move on.` : ''}

RULES:
- You already delivered your pitch. If they respond, engage naturally.
- If they ask questions, answer ONLY using information from the product description above.
- If they push back or raise objections, acknowledge their concern and reframe how the product helps using specific features from the product description.
- Listen for NEW pain points they mention that weren't in your original pitch — these are gold. Probe deeper on these.
- Keep responses concise — 2-3 sentences max. This is a phone call, not an email.
- Sound natural, warm, and confident — like a real founder who genuinely believes in their product.
- After 2-3 exchanges, wrap up: "I'll send you a personalized demo link. Would love to hear what you think."
- Then use the end_call tool.
- If they say they're not interested, be gracious: "Totally understand. I'll drop a demo link in your inbox just in case. Thanks for your time." Then end the call.`,
          builtInTools: {
            endCall: {
              name: 'end_call',
              description: 'End the call after the conversation wraps up naturally.',
              params: {
                systemToolType: 'end_call' as const,
              },
            },
          },
        },
      },
      conversation: {
        maxDurationSeconds: 120,
      },
    },
  });

  console.log('[Voice] Created conversational agent:', response.agentId);
  return response.agentId;
}

/**
 * Fetch the full transcript from ElevenLabs after a call completes.
 * Polls with retry since transcript may not be immediately available.
 */
async function fetchCallTranscript(conversationId: string): Promise<{
  transcript: CallTranscriptEntry[];
  duration: number;
  successful: boolean;
} | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY!;
  const maxRetries = 30;
  const retryDelay = 6_000; // 6 seconds between retries — polls for 3 minutes total

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        { headers: { 'xi-api-key': apiKey }, signal: AbortSignal.timeout(10_000) }
      );

      if (!res.ok) {
        console.log(`[Voice] Transcript fetch attempt ${attempt + 1}: HTTP ${res.status}`);
        await new Promise(r => setTimeout(r, retryDelay));
        continue;
      }

      const data = await res.json();
      const rawTranscript = data.transcript || [];

      if (rawTranscript.length === 0) {
        console.log(`[Voice] Transcript fetch attempt ${attempt + 1}: empty transcript, retrying...`);
        await new Promise(r => setTimeout(r, retryDelay));
        continue;
      }

      const transcript: CallTranscriptEntry[] = rawTranscript
        .filter((t: Record<string, unknown>) => t.message)
        .map((t: Record<string, unknown>) => ({
          role: (t.role as string) === 'agent' ? 'agent' as const : 'user' as const,
          message: t.message as string,
        }));

      return {
        transcript,
        duration: data.call_duration_secs || 0,
        successful: data.analysis?.call_successful === 'success',
      };
    } catch (err) {
      console.log(`[Voice] Transcript fetch attempt ${attempt + 1} error:`, err);
      await new Promise(r => setTimeout(r, retryDelay));
    }
  }

  console.log('[Voice] Failed to fetch transcript after all retries');
  return null;
}

/**
 * Generate call insights by analyzing the transcript with Claude.
 */
async function generateCallInsights(
  transcript: CallTranscriptEntry[],
  companyName: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return 'Unable to generate insights: no API key';

  const transcriptText = transcript
    .map(t => `${t.role === 'agent' ? 'Agent' : 'Prospect'}: ${t.message}`)
    .join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: AbortSignal.timeout(30_000),
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Analyze this sales call transcript with ${companyName}. In 3-5 bullet points, extract:
- New pain points discovered during the call (not from the website)
- Objections raised and how they were handled
- Interest level signals (what excited them, what fell flat)
- Recommended next steps

Transcript:
${transcriptText}`,
        }],
      }),
    });

    if (!res.ok) return 'Insight generation failed';

    const data = await res.json();
    return data.content?.[0]?.text || 'No insights generated';
  } catch {
    return 'Insight generation failed';
  }
}

/**
 * Place an outbound call and asynchronously fetch transcript + insights after.
 */
export async function placeVoiceCall(
  resultId: string,
  script: string,
  agentReasoning: string,
  onStatusChange?: (status: VoiceCallStatus) => void,
  companyName?: string,
  productContext?: string,
  companyUrl?: string
): Promise<VoiceCallResult> {
  const phoneNumber = process.env.DEMO_PHONE_NUMBER!;
  const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID!;
  const voiceId = process.env.ELEVENLABS_VOICE_ID!;

  const emit = onStatusChange || (() => {});

  const callResult: VoiceCallResult = {
    status: 'creating_agent',
    script,
    agentReasoning,
    phoneNumberCalled: phoneNumber,
    startedAt: new Date().toISOString(),
  };
  voiceCallStore.set(resultId, callResult);
  emit('creating_agent');

  try {
    const agentId = await createAgentForCall(script, productContext);
    callResult.elevenlabsAgentId = agentId;

    callResult.status = 'placing_call';
    emit('placing_call');

    const client = getClient();
    const callResponse = await client.conversationalAi.twilio.outboundCall({
      agentId,
      agentPhoneNumberId: phoneNumberId,
      toNumber: phoneNumber,
      conversationInitiationClientData: {
        conversationConfigOverride: {
          agent: {
            firstMessage: script,
          },
          tts: {
            voiceId,
          },
        },
      },
    });

    callResult.status = 'completed';
    callResult.callId = callResponse.callSid ?? undefined;
    callResult.conversationId = callResponse.conversationId ?? undefined;
    callResult.completedAt = new Date().toISOString();
    voiceCallStore.set(resultId, callResult);
    emit('completed');

    // Track the call as an engagement event
    trackVoiceEvent(resultId, companyUrl || '', 'voice_call_placed', { callId: callResult.callId || '' });

    console.log('[Voice] Call placed:', {
      resultId,
      callId: callResult.callId,
      conversationId: callResult.conversationId,
    });

    // Async: fetch transcript + generate insights after call completes
    if (callResult.conversationId) {
      const convId = callResult.conversationId;
      const company = companyName || 'the prospect';

      // Don't await — let this run in the background
      (async () => {
        // Wait for the call to actually finish (it's still in progress when we get here)
        console.log('[Voice] Waiting 20s before fetching transcript...');
        await new Promise(r => setTimeout(r, 20_000));

        logAgentDecision(resultId, 'Fetching call transcript...');
        const transcriptData = await fetchCallTranscript(convId);

        if (transcriptData) {
          callResult.transcript = transcriptData.transcript;
          callResult.callDurationSecs = transcriptData.duration;
          callResult.callSuccessful = transcriptData.successful;
          voiceCallStore.set(resultId, callResult);
          logAgentDecision(resultId, `Transcript captured: ${transcriptData.transcript.length} messages, ${transcriptData.duration}s`);
          trackVoiceEvent(resultId, companyUrl || '', 'voicemail_delivered', {
            duration: String(transcriptData.duration),
            messages: String(transcriptData.transcript.length),
          });

          // Generate insights from the conversation
          logAgentDecision(resultId, 'Analyzing call for new insights...');
          const insights = await generateCallInsights(transcriptData.transcript, company);
          callResult.callInsights = insights;
          voiceCallStore.set(resultId, callResult);
          logAgentDecision(resultId, 'Call insights generated');

          console.log('[Voice] Transcript + insights stored for', resultId);
        } else {
          logAgentDecision(resultId, 'Could not fetch transcript — call may still be in progress');
        }
      })().catch(err => {
        console.error('[Voice] Background transcript fetch failed:', err);
        logAgentDecision(resultId, `Transcript fetch error: ${err instanceof Error ? err.message : 'Unknown'}`);
      });
    }

    return callResult;
  } catch (err) {
    callResult.status = 'failed';
    callResult.error = err instanceof Error ? err.message : 'Unknown error';
    callResult.completedAt = new Date().toISOString();
    voiceCallStore.set(resultId, callResult);
    emit('failed');

    console.error('[Voice] Call failed:', callResult.error);
    return callResult;
  }
}

/** Get voice call result for a given analysis result ID */
export function getVoiceCallResult(resultId: string): VoiceCallResult | undefined {
  return voiceCallStore.get(resultId);
}

/** Store agent decision log entries */
export function logAgentDecision(resultId: string, decision: string): void {
  const existing = agentDecisionsStore.get(resultId) || [];
  existing.push(`[${new Date().toISOString()}] ${decision}`);
  agentDecisionsStore.set(resultId, existing);
}

/** Get agent decisions for a result */
export function getAgentDecisions(resultId: string): string[] {
  return agentDecisionsStore.get(resultId) || [];
}

/** Get all voice call results (for dashboard) */
export function getAllVoiceCallResults(): Map<string, VoiceCallResult> {
  return voiceCallStore;
}
