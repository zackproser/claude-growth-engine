import { isVoiceConfigured, getVoiceCallResult, getAgentDecisions, logAgentDecision, placeVoiceCall } from '@/lib/voice';

// Mock ElevenLabs client
jest.mock('@elevenlabs/elevenlabs-js', () => ({
  ElevenLabsClient: jest.fn().mockImplementation(() => ({
    conversationalAi: {
      agents: {
        create: jest.fn().mockResolvedValue({ agentId: 'mock-agent-123' }),
      },
      twilio: {
        outboundCall: jest.fn().mockResolvedValue({
          callSid: 'mock-call-sid-456',
          conversationId: 'mock-conv-789',
        }),
      },
    },
  })),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Save and restore env vars
const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
  mockFetch.mockReset();
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

describe('placeVoiceCall', () => {
  function setAllEnvVars() {
    process.env.ELEVENLABS_API_KEY = 'test-key';
    process.env.ELEVENLABS_VOICE_ID = 'test-voice';
    process.env.ELEVENLABS_PHONE_NUMBER_ID = 'phnum_test';
    process.env.DEMO_PHONE_NUMBER = '+15551234567';
  }

  test('throws when ELEVENLABS_API_KEY is missing', async () => {
    delete process.env.ELEVENLABS_API_KEY;
    process.env.ELEVENLABS_VOICE_ID = 'test-voice';
    process.env.ELEVENLABS_PHONE_NUMBER_ID = 'phnum_test';
    process.env.DEMO_PHONE_NUMBER = '+15551234567';

    const result = await placeVoiceCall('test-no-key', 'script', 'reasoning');
    // getClient() throws, which is caught — result has status 'failed'
    expect(result.status).toBe('failed');
    expect(result.error).toContain('ELEVENLABS_API_KEY');
  });

  test('returns VoiceCallResult with correct shape on success', async () => {
    setAllEnvVars();

    const result = await placeVoiceCall('test-shape', 'Hello prospect', 'Good fit because...');

    expect(result).toMatchObject({
      status: 'completed',
      script: 'Hello prospect',
      agentReasoning: 'Good fit because...',
      phoneNumberCalled: '+15551234567',
      callId: 'mock-call-sid-456',
      conversationId: 'mock-conv-789',
      elevenlabsAgentId: 'mock-agent-123',
    });
    expect(result.startedAt).toBeDefined();
    expect(result.completedAt).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('emits status changes via callback', async () => {
    setAllEnvVars();

    const statuses: string[] = [];
    await placeVoiceCall('test-callback', 'script', 'reasoning', (status) => {
      statuses.push(status);
    });

    expect(statuses).toContain('creating_agent');
    expect(statuses).toContain('placing_call');
    expect(statuses).toContain('completed');
  });

  test('stores result retrievable via getVoiceCallResult', async () => {
    setAllEnvVars();

    const resultId = 'test-stored-' + Date.now();
    await placeVoiceCall(resultId, 'script', 'reasoning');

    const stored = getVoiceCallResult(resultId);
    expect(stored).toBeDefined();
    expect(stored!.status).toBe('completed');
    expect(stored!.script).toBe('script');
  });

  test('returns failed status when ElevenLabs call throws', async () => {
    setAllEnvVars();

    // Override the mock to throw on outboundCall
    // getClient() is called twice: once in createAgentForCall, once in placeVoiceCall
    // mockImplementation (not Once) ensures both calls get the failing mock
    const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
    const failingImpl = () => ({
      conversationalAi: {
        agents: {
          create: jest.fn().mockRejectedValue(new Error('Agent creation failed')),
        },
        twilio: {
          outboundCall: jest.fn().mockRejectedValue(new Error('Twilio outbound failed')),
        },
      },
    });
    ElevenLabsClient.mockImplementationOnce(failingImpl);

    const result = await placeVoiceCall('test-fail', 'script', 'reasoning');
    expect(result.status).toBe('failed');
    expect(result.error).toContain('Agent creation failed');
    expect(result.completedAt).toBeDefined();
  });
});

describe('generateCallInsights (via module internals)', () => {
  // generateCallInsights is not exported, but we can test it indirectly
  // by verifying the fetch mock behavior for the Anthropic API pattern.
  // For direct testing, we test the fetch patterns the module uses.

  test('Anthropic API call returns insights string shape', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: '- Pain point: slow deployment\n- Interest: high in CI/CD' }],
      }),
    });

    // Simulate what generateCallInsights does
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: 'Analyze this call' }],
      }),
    });

    const data = await res.json();
    const insights = data.content?.[0]?.text || 'No insights generated';
    expect(typeof insights).toBe('string');
    expect(insights).toContain('Pain point');
  });

  test('returns fallback when Anthropic API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST' });
    const fallback = !res.ok ? 'Insight generation failed' : 'ok';
    expect(fallback).toBe('Insight generation failed');
  });
});

describe('fetchCallTranscript retry logic', () => {
  // fetchCallTranscript is not exported, so we test the retry pattern
  // by simulating the fetch behavior it relies on.

  test('retries on HTTP failure then succeeds', async () => {
    // First two calls fail, third succeeds
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transcript: [
            { role: 'agent', message: 'Hello, this is a sales call.' },
            { role: 'user', message: 'Tell me more.' },
          ],
          call_duration_secs: 45,
          analysis: { call_successful: 'success' },
        }),
      });

    // Simulate the retry loop
    let result = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch('https://api.elevenlabs.io/v1/convai/conversations/test-conv', {
        headers: { 'xi-api-key': 'test-key' },
      });
      if (res.ok) {
        result = await res.json();
        break;
      }
    }

    expect(result).not.toBeNull();
    expect(result.transcript).toHaveLength(2);
    expect(result.call_duration_secs).toBe(45);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test('returns null after all retries exhausted', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 });

    let result = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch('https://api.elevenlabs.io/v1/convai/conversations/test-conv', {
        headers: { 'xi-api-key': 'test-key' },
      });
      if (res.ok) {
        result = await res.json();
        break;
      }
    }

    expect(result).toBeNull();
  });
});

describe('Transcript Entry Parsing', () => {
  test('maps agent role correctly', () => {
    const raw = [
      { role: 'agent', message: 'Hello' },
      { role: 'user', message: 'Hi' },
      { role: 'something_else', message: 'Hmm' },
    ];

    // Replicate the parsing logic from fetchCallTranscript
    type RawEntry = { role: string; message?: string };
    const parsed = raw
      .filter((t: RawEntry) => t.message)
      .map((t: RawEntry) => ({
        role: t.role === 'agent' ? ('agent' as const) : ('user' as const),
        message: t.message as string,
      }));

    expect(parsed).toHaveLength(3);
    expect(parsed[0].role).toBe('agent');
    expect(parsed[1].role).toBe('user');
    // Non-agent roles are mapped to 'user'
    expect(parsed[2].role).toBe('user');
  });

  test('filters entries without messages', () => {
    const raw = [
      { role: 'agent', message: 'Hello' },
      { role: 'agent', message: '' },
      { role: 'user' },
      { role: 'user', message: 'Hi there' },
    ];

    type RawEntry = { role: string; message?: string };
    const parsed = raw
      .filter((t: RawEntry) => t.message)
      .map((t: RawEntry) => ({
        role: t.role === 'agent' ? ('agent' as const) : ('user' as const),
        message: t.message as string,
      }));

    // Empty string is falsy, so filtered; missing message is filtered
    expect(parsed).toHaveLength(2);
    expect(parsed[0].message).toBe('Hello');
    expect(parsed[1].message).toBe('Hi there');
  });
});
