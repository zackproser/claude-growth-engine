import { NextRequest, NextResponse } from 'next/server';
import { validateAndParseSpec } from '@/lib/spec-parser';
import { runGrowthAgent } from '@/lib/agent';
import { logNewLead, isSheetsConfigured } from '@/lib/sheets';

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
          const send = (event: string, data: unknown) => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
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

            send('result', result);
          } catch (err) {
            send('error', { error: err instanceof Error ? err.message : 'Analysis failed' });
          } finally {
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
