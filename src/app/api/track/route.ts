import { NextRequest, NextResponse } from 'next/server';
import type { TrackingEvent } from '@/lib/types';

// In-memory event store (would write to Google Sheets via MCP in production)
const events: TrackingEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const event: TrackingEvent = await request.json();
    event.timestamp = new Date().toISOString();
    events.push(event);

    // TODO: Write to Google Sheets via MCP when configured
    // For now, log and store in memory
    console.log('[Track]', event.eventType, event.companyUrl, event.metadata);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Tracking failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ events });
}
