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

  describe('voice event signal summaries', () => {
    test('voice_call_placed produces "Voicemail sent" signal', () => {
      const events = [makeEvent({ eventType: 'voice_call_placed' })];
      const scores = computeLeadScores(events);
      expect(scores[0].signals).toContain('Voicemail sent');
    });

    test('voicemail_delivered produces "Voicemail delivered" signal', () => {
      const events = [makeEvent({ eventType: 'voicemail_delivered' })];
      const scores = computeLeadScores(events);
      expect(scores[0].signals).toContain('Voicemail delivered');
    });

    test('voicemail_listened produces "Listened to voicemail" signal', () => {
      const events = [makeEvent({ eventType: 'voicemail_listened' })];
      const scores = computeLeadScores(events);
      expect(scores[0].signals).toContain('Listened to voicemail');
    });

    test('voice_call_placed has weight 10', () => {
      const events = [makeEvent({ eventType: 'voice_call_placed' })];
      const scores = computeLeadScores(events);
      expect(scores[0].score).toBe(10);
    });

    test('voicemail_delivered has weight 20', () => {
      const events = [makeEvent({ eventType: 'voicemail_delivered' })];
      const scores = computeLeadScores(events);
      expect(scores[0].score).toBe(20);
    });

    test('voicemail_listened has weight 35', () => {
      const events = [makeEvent({ eventType: 'voicemail_listened' })];
      const scores = computeLeadScores(events);
      expect(scores[0].score).toBe(35);
    });
  });

  describe('mixed voice + non-voice events', () => {
    test('combines voice and web signals for same company', () => {
      const events = [
        makeEvent({ eventType: 'demo_viewed', companyUrl: 'https://mixed.com' }),
        makeEvent({ eventType: 'voice_call_placed', companyUrl: 'https://mixed.com' }),
        makeEvent({ eventType: 'voicemail_delivered', companyUrl: 'https://mixed.com' }),
        makeEvent({ eventType: 'api_playground', companyUrl: 'https://mixed.com' }),
      ];
      const scores = computeLeadScores(events);
      expect(scores).toHaveLength(1);
      // demo_viewed(10) + voice_call_placed(10) + voicemail_delivered(20) + api_playground(20) = 60
      expect(scores[0].score).toBe(60);
      expect(scores[0].temperature).toBe('warm');
      expect(scores[0].signals).toContain('Voicemail sent');
      expect(scores[0].signals).toContain('Voicemail delivered');
    });

    test('voice + web pushes lead to hot when combined', () => {
      const events = [
        makeEvent({ eventType: 'voicemail_listened', companyUrl: 'https://hot.com' }),
        makeEvent({ eventType: 'feedback_submitted', companyUrl: 'https://hot.com', metadata: { feedback: 'amazing' } }),
        makeEvent({ eventType: 'lang_selected', companyUrl: 'https://hot.com', metadata: { language: 'Python' } }),
      ];
      const scores = computeLeadScores(events);
      // voicemail_listened(35) + feedback_submitted(30) + lang_selected(25) = 90
      expect(scores[0].score).toBe(90);
      expect(scores[0].temperature).toBe('hot');
      expect(scores[0].signals).toContain('Listened to voicemail');
      expect(scores[0].signals).toContain('Uses Python');
    });

    test('voice events for different companies scored separately', () => {
      const events = [
        makeEvent({ eventType: 'voice_call_placed', companyUrl: 'https://a.com' }),
        makeEvent({ eventType: 'voicemail_listened', companyUrl: 'https://b.com' }),
      ];
      const scores = computeLeadScores(events);
      expect(scores).toHaveLength(2);
      // Sorted descending: b.com (35) first, a.com (10) second
      expect(scores[0].companyUrl).toBe('https://b.com');
      expect(scores[0].score).toBe(35);
      expect(scores[1].companyUrl).toBe('https://a.com');
      expect(scores[1].score).toBe(10);
    });
  });

  describe('lang_selected edge cases', () => {
    test('lang_selected without metadata.language does not add language signal', () => {
      const events = [makeEvent({ eventType: 'lang_selected' })];
      const scores = computeLeadScores(events);
      expect(scores[0].score).toBe(25);
      // Should not have a "Uses ..." signal since no language metadata
      const langSignals = scores[0].signals.filter(s => s.startsWith('Uses '));
      expect(langSignals).toHaveLength(0);
    });

    test('lang_selected with metadata.language adds "Uses <lang>" signal', () => {
      const events = [makeEvent({ eventType: 'lang_selected', metadata: { language: 'Go' } })];
      const scores = computeLeadScores(events);
      expect(scores[0].signals).toContain('Uses Go');
    });

    test('multiple lang_selected for same language does not duplicate signal', () => {
      const events = [
        makeEvent({ eventType: 'lang_selected', metadata: { language: 'Rust' } }),
        makeEvent({ eventType: 'lang_selected', metadata: { language: 'Rust' } }),
      ];
      const scores = computeLeadScores(events);
      const rustSignals = scores[0].signals.filter(s => s === 'Uses Rust');
      expect(rustSignals).toHaveLength(1);
      // 25 + 25 + 5 (repeat bonus) = 55
      expect(scores[0].score).toBe(55);
    });

    test('multiple lang_selected for different languages adds both signals', () => {
      const events = [
        makeEvent({ eventType: 'lang_selected', metadata: { language: 'Python' } }),
        makeEvent({ eventType: 'lang_selected', metadata: { language: 'TypeScript' } }),
      ];
      const scores = computeLeadScores(events);
      expect(scores[0].signals).toContain('Uses Python');
      expect(scores[0].signals).toContain('Uses TypeScript');
    });
  });
});
