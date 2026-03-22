import { NextRequest, NextResponse } from 'next/server';
import { validateAndParseSpec } from '@/lib/spec-parser';
import { runCompanyResearch, generateAllArtifacts } from '@/lib/agent';
import { logNewLead, isSheetsConfigured } from '@/lib/sheets';
import type { AnalysisResult } from '@/lib/types';
import { randomUUID } from 'crypto';

// In-memory store for results
const resultsStore = new Map<string, AnalysisResult>();

export { resultsStore };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawSpec, targetUrl, stream: useStream } = body;

    if (!rawSpec || !targetUrl) {
      return NextResponse.json({ error: 'Missing rawSpec or targetUrl' }, { status: 400 });
    }

    const validation = await validateAndParseSpec(rawSpec);
    if (!validation.valid || !validation.parsed) {
      return NextResponse.json({ error: 'Invalid OpenAPI spec', details: validation.errors }, { status: 400 });
    }

    const spec = validation.parsed;

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
            const id = randomUUID();

            // Phase 1: Company Research (~60-90s)
            const company = await runCompanyResearch(spec, targetUrl, (phase) => {
              send('progress', phase);
            });

            // Create partial result and store it immediately
            const partialResult: AnalysisResult = {
              id,
              createdAt: new Date().toISOString(),
              spec,
              company,
              artifacts: [],
              demoPageUrl: `/demo/${id}`,
            };
            resultsStore.set(id, partialResult);

            // Send result event — this triggers navigation to results page
            send('result', partialResult);
            send('progress', { step: 'Generating personalized outreach...', detail: '5 artifacts in parallel' });

            // Phase 2: Parallel Artifact Generation (~15-20s)
            const { artifacts, voicemailReasoning } = await generateAllArtifacts(
              spec,
              company,
              (artifact) => {
                // Update stored result as each artifact arrives
                partialResult.artifacts.push(artifact);
                resultsStore.set(id, partialResult);
                send('artifact_ready', artifact);
              }
            );

            // Final update with all artifacts
            partialResult.artifacts = artifacts;
            partialResult.voicemailReasoning = voicemailReasoning;
            resultsStore.set(id, partialResult);

            send('all_done', partialResult);

            if (isSheetsConfigured()) {
              logNewLead(company, partialResult.demoPageUrl, artifacts.length)
                .catch(err => console.error('[Analyze] Sheets lead log failed:', err));
            }
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

    // Non-streaming fallback — runs both phases sequentially
    const id = randomUUID();
    const company = await runCompanyResearch(spec, targetUrl);
    const { artifacts, voicemailReasoning } = await generateAllArtifacts(spec, company);

    const result: AnalysisResult = {
      id,
      createdAt: new Date().toISOString(),
      spec,
      company,
      artifacts,
      demoPageUrl: `/demo/${id}`,
      voicemailReasoning,
    };
    resultsStore.set(id, result);

    if (isSheetsConfigured()) {
      logNewLead(company, result.demoPageUrl, artifacts.length)
        .catch(err => console.error('[Analyze] Sheets lead log failed:', err));
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Analysis failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Analysis failed' }, { status: 500 });
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
