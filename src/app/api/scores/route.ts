import { NextResponse } from 'next/server';
import { computeLeadScores } from '@/lib/scoring';

export async function GET() {
  try {
    // Fetch from the track route's in-memory store via HTTP
    const trackRes = await fetch('http://localhost:3000/api/track');
    const { events } = await trackRes.json();
    const scores = computeLeadScores(events);
    return NextResponse.json({ scores, eventCount: events.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to compute scores' },
      { status: 500 }
    );
  }
}
