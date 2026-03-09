import { NextResponse } from 'next/server';
import { computeLeadScores } from '@/lib/scoring';

// Import the events array from track route — shared in-memory store
// In a real app this would be a database. For the demo, we fetch from the track GET endpoint.
export async function GET() {
  try {
    // Fetch events from the track endpoint's in-memory store
    const trackRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/track`);
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
