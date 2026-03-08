import { NextRequest, NextResponse } from 'next/server';
import { validateAndParseSpec } from '@/lib/spec-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawSpec } = body;

    if (!rawSpec) {
      return NextResponse.json(
        { error: 'Missing rawSpec' },
        { status: 400 }
      );
    }

    const result = await validateAndParseSpec(rawSpec);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Validation failed' },
      { status: 500 }
    );
  }
}
