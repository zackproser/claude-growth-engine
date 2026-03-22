import { NextRequest, NextResponse } from 'next/server';
import { getVoiceCallResult, getAgentDecisions, getAllVoiceCallResults, isVoiceConfigured } from '@/lib/voice';

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
