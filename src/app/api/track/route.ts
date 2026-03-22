import { NextRequest, NextResponse } from 'next/server';
import type { TrackingEvent } from '@/lib/types';
import { logTrackingEvent, isSheetsConfigured } from '@/lib/sheets';
import { events } from '@/lib/tracking';

export async function POST(request: NextRequest) {
  try {
    const event: TrackingEvent = await request.json();
    event.timestamp = new Date().toISOString();
    events.push(event);

    console.log('[Track]', event.eventType, event.companyUrl, event.metadata);

    if (isSheetsConfigured()) {
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
