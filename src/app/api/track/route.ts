import { NextRequest, NextResponse } from 'next/server';
import type { TrackingEvent } from '@/lib/types';
import { logTrackingEvent, isSheetsConfigured } from '@/lib/sheets';

// In-memory event store (always kept as fallback + fast reads)
const events: TrackingEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const event: TrackingEvent = await request.json();
    event.timestamp = new Date().toISOString();
    events.push(event);

    console.log('[Track]', event.eventType, event.companyUrl, event.metadata);

    // Write to Google Sheets if configured
    if (isSheetsConfigured()) {
      // Fire and forget — don't block the response on Sheets write
      logTrackingEvent(
        event.resultId,
        event.companyUrl,
        event.eventType,
        event.metadata
      ).catch(err => console.error('[Track] Sheets write failed:', err));
    }

    return NextResponse.json({ success: true, sheetsEnabled: isSheetsConfigured() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Tracking failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    events,
    sheetsEnabled: isSheetsConfigured(),
    count: events.length,
  });
}
