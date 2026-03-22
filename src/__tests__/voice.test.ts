import { isVoiceConfigured, getVoiceCallResult, getAgentDecisions, logAgentDecision } from '@/lib/voice';

// Save and restore env vars
const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
});

describe('Voice Configuration', () => {
  test('isVoiceConfigured returns false when no env vars set', () => {
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_VOICE_ID;
    delete process.env.ELEVENLABS_PHONE_NUMBER_ID;
    delete process.env.DEMO_PHONE_NUMBER;
    expect(isVoiceConfigured()).toBe(false);
  });

  test('isVoiceConfigured returns false when partially configured', () => {
    process.env.ELEVENLABS_API_KEY = 'test-key';
    process.env.ELEVENLABS_VOICE_ID = 'test-voice';
    delete process.env.ELEVENLABS_PHONE_NUMBER_ID;
    delete process.env.DEMO_PHONE_NUMBER;
    expect(isVoiceConfigured()).toBe(false);
  });

  test('isVoiceConfigured returns true when all env vars set', () => {
    process.env.ELEVENLABS_API_KEY = 'test-key';
    process.env.ELEVENLABS_VOICE_ID = 'test-voice';
    process.env.ELEVENLABS_PHONE_NUMBER_ID = 'phnum_test';
    process.env.DEMO_PHONE_NUMBER = '+15551234567';
    expect(isVoiceConfigured()).toBe(true);
  });
});

describe('Voice Call Result Store', () => {
  test('returns undefined for unknown result ID', () => {
    expect(getVoiceCallResult('nonexistent')).toBeUndefined();
  });
});

describe('Agent Decision Logging', () => {
  test('logs and retrieves decisions', () => {
    const id = 'test-decisions-' + Date.now();
    logAgentDecision(id, 'Chose pain point A');
    logAgentDecision(id, 'Script generated');

    const decisions = getAgentDecisions(id);
    expect(decisions).toHaveLength(2);
    expect(decisions[0]).toContain('Chose pain point A');
    expect(decisions[1]).toContain('Script generated');
  });

  test('returns empty array for unknown result', () => {
    expect(getAgentDecisions('nonexistent')).toEqual([]);
  });

  test('decisions include timestamps', () => {
    const id = 'test-timestamps-' + Date.now();
    logAgentDecision(id, 'test');
    const decisions = getAgentDecisions(id);
    expect(decisions[0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
  });
});
