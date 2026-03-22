import { NextRequest, NextResponse } from 'next/server';
import { getVoiceCallResult, getAgentDecisions, getAllVoiceCallResults, isVoiceConfigured, placeVoiceCall, logAgentDecision } from '@/lib/voice';

/**
 * GET /api/voice?id=<resultId> — Get voice call status for a specific result
 * GET /api/voice — Get all voice call results (for dashboard)
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (id) {
    const callResult = getVoiceCallResult(id);
    const decisions = getAgentDecisions(id);
    return NextResponse.json({
      configured: isVoiceConfigured(),
      call: callResult || null,
      agentDecisions: decisions,
    });
  }

  // Return all voice call results for dashboard
  const allResults = getAllVoiceCallResults();
  const calls: Record<string, unknown> = {};
  for (const [resultId, call] of allResults) {
    calls[resultId] = {
      ...call,
      agentDecisions: getAgentDecisions(resultId),
    };
  }

  return NextResponse.json({
    configured: isVoiceConfigured(),
    calls,
    count: allResults.size,
  });
}

/**
 * POST /api/voice — Place a call
 * Body: { resultId, script, companyName, productContext, reasoning }
 * Client sends everything needed — no server-side lookup required.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resultId, script, companyName, companyUrl, productContext, reasoning } = body;

    if (!resultId || !script) {
      return NextResponse.json({ error: 'Missing resultId or script' }, { status: 400 });
    }

    if (!isVoiceConfigured()) {
      return NextResponse.json({ error: 'Voice calling not configured' }, { status: 400 });
    }

    const voicemailReasoning = reasoning || 'Personalized outreach based on prospect analysis.';

    logAgentDecision(resultId, `Manual call triggered`);
    logAgentDecision(resultId, `Voicemail strategy: ${voicemailReasoning}`);

    const callResult = await placeVoiceCall(
      resultId,
      script,
      voicemailReasoning,
      undefined,
      companyName || 'the prospect',
      productContext || '',
      companyUrl || ''
    );

    logAgentDecision(resultId, `Call ${callResult.status}: ${callResult.callId || 'no call ID'}`);

    return NextResponse.json(callResult);
  } catch (err) {
    console.error('[Voice] Call failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Call failed' },
      { status: 500 }
    );
  }
}
