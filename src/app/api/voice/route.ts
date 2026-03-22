import { NextRequest, NextResponse } from 'next/server';
import { getVoiceCallResult, getAgentDecisions, getAllVoiceCallResults, isVoiceConfigured, placeVoiceCall, logAgentDecision } from '@/lib/voice';
import { resultsStore } from '@/app/api/analyze/route';

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
 * POST /api/voice — Place a call for a given result ID
 * Body: { resultId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { resultId } = await request.json();
    if (!resultId) {
      return NextResponse.json({ error: 'Missing resultId' }, { status: 400 });
    }

    if (!isVoiceConfigured()) {
      return NextResponse.json({ error: 'Voice calling not configured' }, { status: 400 });
    }

    // Get the analysis result to find the script + spec
    const result = resultsStore.get(resultId) as Record<string, unknown> | undefined;
    if (!result) {
      return NextResponse.json({ error: 'Result not found — run analysis first' }, { status: 404 });
    }

    const artifacts = result.artifacts as Array<{ type: string; content: string }>;
    const spec = result.spec as { name: string; description?: string; endpoints: Array<{ method: string; path: string; summary?: string }> };
    const company = result.company as { name: string };
    const voicemailReasoning = (result.voicemailReasoning as string) || 'Personalized outreach based on prospect analysis.';

    const scriptArtifact = artifacts?.find(a => a.type === 'voicemail-script');
    if (!scriptArtifact) {
      return NextResponse.json({ error: 'No voicemail script found in analysis' }, { status: 400 });
    }

    const productContext = `Product: ${spec.name}\n${spec.description || ''}\nEndpoints: ${spec.endpoints.slice(0, 10).map(e => `${e.method} ${e.path}${e.summary ? ' — ' + e.summary : ''}`).join('\n')}`;

    logAgentDecision(resultId, `Manual call triggered`);
    logAgentDecision(resultId, `Voicemail strategy: ${voicemailReasoning}`);

    const callResult = await placeVoiceCall(
      resultId,
      scriptArtifact.content,
      voicemailReasoning,
      undefined,
      company.name,
      productContext
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
