import { NextRequest, NextResponse } from 'next/server';
import { validateAndParseSpec } from '@/lib/spec-parser';
import { runGrowthAgent } from '@/lib/agent';
import { logNewLead, isSheetsConfigured } from '@/lib/sheets';
import { placeVoiceCall, logAgentDecision, isVoiceConfigured } from '@/lib/voice';

// In-memory store for results
const resultsStore = new Map<string, unknown>();

export { resultsStore };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawSpec, targetUrl, stream: useStream } = body;

    if (!rawSpec || !targetUrl) {
      return NextResponse.json(
        { error: 'Missing rawSpec or targetUrl' },
        { status: 400 }
      );
    }

    // Validate the spec
    const validation = await validateAndParseSpec(rawSpec);
    if (!validation.valid || !validation.parsed) {
      return NextResponse.json(
        { error: 'Invalid OpenAPI spec', details: validation.errors },
        { status: 400 }
      );
    }

    // If streaming requested, use SSE
    if (useStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          let controllerClosed = false;
          const send = (event: string, data: unknown) => {
            if (controllerClosed) return;
            try {
              controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            } catch {
              controllerClosed = true;
            }
          };

          try {
            const result = await runGrowthAgent(validation.parsed!, targetUrl, (phase) => {
              send('progress', phase);
            });

            resultsStore.set(result.id, result);

            // Log lead to Google Sheets
            if (isSheetsConfigured()) {
              logNewLead(result.company, result.demoPageUrl, result.artifacts.length)
                .catch(err => console.error('[Analyze] Sheets lead log failed:', err));
            }

            // Auto-place voice call if configured
            if (isVoiceConfigured()) {
              const voicemailArtifact = result.artifacts.find(a => a.type === 'voicemail-script');
              if (voicemailArtifact) {
                const reasoning = result.voicemailReasoning || 'Personalized voicemail based on prospect analysis.';
                logAgentDecision(result.id, `Voicemail strategy: ${reasoning}`);
                logAgentDecision(result.id, `Script generated (${voicemailArtifact.content.length} chars)`);

                send('progress', { step: 'Generating voicemail...', detail: 'Placing outbound call via ElevenLabs' });

                try {
                  const callResult = await placeVoiceCall(
                    result.id,
                    voicemailArtifact.content,
                    reasoning,
                    (status) => {
                      send('progress', { step: `Voice call: ${status.replace(/_/g, ' ')}` });
                    },
                    result.company.name
                  );
                  logAgentDecision(result.id, `Call ${callResult.status}: ${callResult.callId || 'no call ID'}`);
                  send('voice_update', callResult);
                } catch (err) {
                  const errMsg = err instanceof Error ? err.message : 'Voice call failed';
                  logAgentDecision(result.id, `Call failed: ${errMsg}`);
                  send('voice_error', { error: errMsg });
                }
              }
            }

            send('result', result);
          } catch (err) {
            send('error', { error: err instanceof Error ? err.message : 'Analysis failed' });
          } finally {
            controllerClosed = true;
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Non-streaming fallback
    const result = await runGrowthAgent(validation.parsed, targetUrl);
    resultsStore.set(result.id, result);

    if (isSheetsConfigured()) {
      logNewLead(result.company, result.demoPageUrl, result.artifacts.length)
        .catch(err => console.error('[Analyze] Sheets lead log failed:', err));
    }

    // Auto-place voice call if configured
    if (isVoiceConfigured()) {
      const voicemailArtifact = result.artifacts.find(a => a.type === 'voicemail-script');
      if (voicemailArtifact) {
        const reasoning = result.voicemailReasoning || 'Personalized voicemail based on prospect analysis.';
        logAgentDecision(result.id, `Voicemail strategy: ${reasoning}`);
        try {
          const callResult = await placeVoiceCall(result.id, voicemailArtifact.content, reasoning, undefined, result.company.name);
          logAgentDecision(result.id, `Call ${callResult.status}: ${callResult.callId || 'no call ID'}`);
        } catch (err) {
          logAgentDecision(result.id, `Call failed: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Analysis failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const result = resultsStore.get(id);
  if (!result) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}
