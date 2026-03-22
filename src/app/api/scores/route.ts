import { NextResponse } from 'next/server';
import { computeLeadScores } from '@/lib/scoring';
import { trackingEvents } from '@/app/api/track/route';

export async function GET() {
  const scores = computeLeadScores(trackingEvents);
  return NextResponse.json({ scores, eventCount: trackingEvents.length });
}
