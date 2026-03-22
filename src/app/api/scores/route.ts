import { NextResponse } from 'next/server';
import { computeLeadScores } from '@/lib/scoring';
import { events } from '@/lib/tracking';

export async function GET() {
  const scores = computeLeadScores(events);
  return NextResponse.json({ scores, eventCount: events.length });
}
