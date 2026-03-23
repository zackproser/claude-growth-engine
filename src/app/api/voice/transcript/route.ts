import { NextRequest, NextResponse } from 'next/server';
import { getVoiceCallResult, logAgentDecision } from '@/lib/voice';

export async function POST(request: NextRequest) {
  try {
    const { resultId, conversationId, companyName } = await request.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    logAgentDecision(resultId, 'Manual transcript retry triggered');

    // Fetch transcript from ElevenLabs
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      { headers: { 'xi-api-key': apiKey } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `ElevenLabs API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const rawTranscript = data.transcript || [];

    if (rawTranscript.length === 0) {
      return NextResponse.json({ error: 'Transcript not yet available — try again in a few seconds' }, { status: 404 });
    }

    const transcript = rawTranscript
      .filter((t: Record<string, unknown>) => t.message)
      .map((t: Record<string, unknown>) => ({
        role: (t.role as string) === 'agent' ? 'agent' : 'user',
        message: t.message as string,
      }));

    const duration = data.call_duration_secs || 0;
    const successful = data.analysis?.call_successful === 'success';

    // Update the in-memory voice call result
    const callResult = getVoiceCallResult(resultId);
    if (callResult) {
      callResult.transcript = transcript;
      callResult.callDurationSecs = duration;
      callResult.callSuccessful = successful;
    }

    logAgentDecision(resultId, `Transcript fetched: ${transcript.length} messages, ${duration}s`);

    // Generate insights
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && transcript.length > 0) {
      const transcriptText = transcript
        .map((t: { role: string; message: string }) => `${t.role === 'agent' ? 'Agent' : 'Prospect'}: ${t.message}`)
        .join('\n');

      try {
        const insightRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: `Analyze this sales call transcript with ${companyName || 'the prospect'}. In 3-5 bullet points, extract:\n- New pain points discovered during the call\n- Objections raised and how they were handled\n- Interest level signals\n- Recommended next steps\n\nTranscript:\n${transcriptText}`,
            }],
          }),
        });

        if (insightRes.ok) {
          const insightData = await insightRes.json();
          const insights = insightData.content?.[0]?.text || '';
          if (callResult) {
            callResult.callInsights = insights;
          }
          logAgentDecision(resultId, 'Call insights generated via manual retry');
        }
      } catch {
        logAgentDecision(resultId, 'Insight generation failed on retry');
      }
    }

    // Track the event
    fetch('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultId,
        companyUrl: '',
        eventType: 'voicemail_delivered',
        metadata: { duration: String(duration), messages: String(transcript.length), source: 'manual_retry' },
      }),
    }).catch(() => {});

    return NextResponse.json({
      transcript,
      duration,
      successful,
      insights: callResult?.callInsights,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}
