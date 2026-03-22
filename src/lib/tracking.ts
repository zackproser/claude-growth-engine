import type { TrackingEvent } from './types';

// Shared in-memory event store — used by both /api/track and voice.ts
export const events: TrackingEvent[] = [];

export function addTrackingEvent(
  resultId: string,
  companyUrl: string,
  eventType: TrackingEvent['eventType'],
  metadata?: Record<string, string>
) {
  const event: TrackingEvent = {
    resultId,
    companyUrl,
    eventType,
    metadata,
    timestamp: new Date().toISOString(),
  };
  events.push(event);
  console.log('[Track]', eventType, companyUrl, metadata);
}
