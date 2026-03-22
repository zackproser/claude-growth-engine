import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { VoiceCallResult, VoiceCallStatus } from './types';

// In-memory stores
const voiceCallStore = new Map<string, VoiceCallResult>();
const agentDecisionsStore = new Map<string, string[]>();

function getClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');
  return new ElevenLabsClient({ apiKey });
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
 * Create a fresh ElevenLabs agent for this specific call.
 * Each agent gets the actual voicemail script baked into its config
 * so voicemail detection delivers the correct personalized message.
 */
async function createAgentForCall(script: string): Promise<string> {
  const client = getClient();
  const voiceId = process.env.ELEVENLABS_VOICE_ID!;

  const response = await client.conversationalAi.agents.create({
    name: 'Growth Engine Voicemail Agent',
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
        firstMessage: '',
        language: 'en',
        prompt: {
          prompt: `You are a startup founder placing a call to leave a personalized voicemail.

CRITICAL RULES:
- Do NOT speak first. Wait and listen to determine if a human answered or if it's a voicemail system.
- If you hear a voicemail greeting (e.g., "leave a message", "I'll see if this person is available", beep, or any automated/recorded message), stay silent. The voicemail_detection tool will handle leaving the message automatically.
- If a REAL PERSON answers and speaks to you conversationally, deliver this message exactly: "${script.replace(/"/g, '\\"')}"
- After delivering to a real person, use the end_call tool.
- Do NOT improvise, summarize, or shorten the message. Deliver it word for word.
- Sound natural, warm, and confident — like a real founder, not a robot.`,
          builtInTools: {
            endCall: {
              name: 'end_call',
              description: 'End the call after delivering the voicemail message.',
              params: {
                systemToolType: 'end_call' as const,
              },
            },
            voicemailDetection: {
              name: 'voicemail_detection',
              description: 'Detect if a voicemail system answered the call. Leave the personalized message.',
              params: {
                systemToolType: 'voicemail_detection' as const,
                voicemailMessage: script,
              },
            },
          },
        },
      },
      conversation: {
        maxDurationSeconds: 60,
      },
    },
  });

  console.log('[Voice] Created agent for call:', response.agentId);
  return response.agentId;
}

/**
 * Place an outbound voicemail call for a prospect.
 * Creates a fresh agent per call with the script baked into voicemailMessage.
 */
export async function placeVoiceCall(
  resultId: string,
  script: string,
  agentReasoning: string,
  onStatusChange?: (status: VoiceCallStatus) => void
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
    // Create a fresh agent with the script baked into voicemailMessage
    const agentId = await createAgentForCall(script);
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

    console.log('[Voice] Call placed:', {
      resultId,
      callId: callResult.callId,
      conversationId: callResult.conversationId,
    });

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
