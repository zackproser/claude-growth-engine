import { computeLeadScores } from '@/lib/scoring';
import type { TrackingEvent } from '@/lib/types';

function makeEvent(overrides: Partial<TrackingEvent> & { eventType: TrackingEvent['eventType'] }): TrackingEvent {
  return {
    resultId: 'test-result-1',
    companyUrl: 'https://example.com',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('Lead Scoring', () => {
  test('returns empty array for no events', () => {
    expect(computeLeadScores([])).toEqual([]);
  });

  test('scores a single demo view', () => {
    const scores = computeLeadScores([makeEvent({ eventType: 'demo_viewed' })]);
    expect(scores).toHaveLength(1);
    expect(scores[0].score).toBe(10);
    expect(scores[0].temperature).toBe('cold');
  });

  test('hot lead threshold at 80+', () => {
    // feedback_submitted (30) + api_playground (20) + lang_selected (25) + demo_viewed (10) = 85
    const events = [
      makeEvent({ eventType: 'feedback_submitted', metadata: { feedback: 'great' } }),
      makeEvent({ eventType: 'api_playground' }),
      makeEvent({ eventType: 'lang_selected', metadata: { language: 'Python' } }),
      makeEvent({ eventType: 'demo_viewed' }),
    ];
    const scores = computeLeadScores(events);
    expect(scores[0].temperature).toBe('hot');
    expect(scores[0].score).toBeGreaterThanOrEqual(80);
  });

  test('warm lead threshold 40-79', () => {
    // api_playground (20) + lang_selected (25) = 45
    const events = [
      makeEvent({ eventType: 'api_playground' }),
      makeEvent({ eventType: 'lang_selected', metadata: { language: 'Node' } }),
    ];
    const scores = computeLeadScores(events);
    expect(scores[0].temperature).toBe('warm');
  });

  test('score capped at 100', () => {
    const events = Array.from({ length: 10 }, () =>
      makeEvent({ eventType: 'feedback_submitted', metadata: { feedback: 'wow' } })
    );
    const scores = computeLeadScores(events);
    expect(scores[0].score).toBe(100);
  });

  test('repeat engagement bonus applied', () => {
    const events = [
      makeEvent({ eventType: 'demo_viewed', timestamp: '2026-01-01T00:00:00Z' }),
      makeEvent({ eventType: 'demo_viewed', timestamp: '2026-01-01T00:01:00Z' }),
    ];
    const scores = computeLeadScores(events);
    // First demo_viewed: 10, second: 10 + 5 repeat bonus = 25 total
    expect(scores[0].score).toBe(25);
  });

  test('groups events by company URL', () => {
    const events = [
      makeEvent({ eventType: 'demo_viewed', companyUrl: 'https://a.com' }),
      makeEvent({ eventType: 'demo_viewed', companyUrl: 'https://b.com' }),
    ];
    const scores = computeLeadScores(events);
    expect(scores).toHaveLength(2);
  });

  test('voice signals are scored correctly', () => {
    const events = [
      makeEvent({ eventType: 'voice_call_placed' }),
      makeEvent({ eventType: 'voicemail_delivered' }),
    ];
    const scores = computeLeadScores(events);
    // voice_call_placed (10) + voicemail_delivered (20) = 30
    expect(scores[0].score).toBe(30);
  });

  test('voicemail_listened is a strong signal', () => {
    const events = [makeEvent({ eventType: 'voicemail_listened' })];
    const scores = computeLeadScores(events);
    expect(scores[0].score).toBe(35);
    expect(scores[0].signals).toContain('Listened to voicemail');
  });

  test('voice signals appear in signal summary', () => {
    const events = [
      makeEvent({ eventType: 'voice_call_placed' }),
      makeEvent({ eventType: 'voicemail_delivered' }),
    ];
    const scores = computeLeadScores(events);
    expect(scores[0].signals).toContain('Voicemail sent');
    expect(scores[0].signals).toContain('Voicemail delivered');
  });

  test('next action is immediate for hot leads', () => {
    const events = Array.from({ length: 5 }, () => makeEvent({ eventType: 'feedback_submitted', metadata: { feedback: 'x' } }));
    const scores = computeLeadScores(events);
    expect(scores[0].nextAction).toContain('Follow up today');
  });

  test('sorts by score descending', () => {
    const events = [
      makeEvent({ eventType: 'page_view', companyUrl: 'https://low.com' }),
      makeEvent({ eventType: 'feedback_submitted', companyUrl: 'https://high.com', metadata: { feedback: 'x' } }),
    ];
    const scores = computeLeadScores(events);
    expect(scores[0].companyUrl).toBe('https://high.com');
  });
});
