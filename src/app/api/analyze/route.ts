import { NextRequest, NextResponse } from 'next/server';
import { validateAndParseSpec } from '@/lib/spec-parser';
import { runGrowthAgent } from '@/lib/agent';

// In-memory store for results (would be a DB in production)
// Exported so other routes can access it
const resultsStore = new Map<string, unknown>();

export { resultsStore };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawSpec, targetUrl } = body;

    if (!rawSpec || !targetUrl) {
      return NextResponse.json(
        { error: 'Missing rawSpec or targetUrl' },
        { status: 400 }
      );
    }

    // Validate the spec with swagger-parser
    const validation = await validateAndParseSpec(rawSpec);
    if (!validation.valid || !validation.parsed) {
      return NextResponse.json(
        { error: 'Invalid OpenAPI spec', details: validation.errors },
        { status: 400 }
      );
    }

    // Run the growth agent
    const result = await runGrowthAgent(validation.parsed, targetUrl);

    // Store the result
    resultsStore.set(result.id, result);

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
