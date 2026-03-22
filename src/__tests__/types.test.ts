import type {
  VoiceCallStatus,
  CallTranscriptEntry,
  AnalysisResult,
  CompanyResearch,
  OutreachArtifact,
  VoiceCallResult,
} from '@/lib/types';

describe('Type Shape Verification', () => {
  describe('VoiceCallStatus', () => {
    test('all valid status values are accepted', () => {
      const validStatuses: VoiceCallStatus[] = [
        'generating_script',
        'creating_agent',
        'placing_call',
        'ringing',
        'in_progress',
        'completed',
        'failed',
        'no_answer',
      ];
      expect(validStatuses).toHaveLength(8);
      for (const status of validStatuses) {
        expect(typeof status).toBe('string');
      }
    });

    test('VoiceCallResult status field accepts all VoiceCallStatus values', () => {
      const statuses: VoiceCallStatus[] = [
        'generating_script', 'creating_agent', 'placing_call',
        'ringing', 'in_progress', 'completed', 'failed', 'no_answer',
      ];
      for (const status of statuses) {
        const result: VoiceCallResult = {
          status,
          script: 'test',
          agentReasoning: 'test',
          phoneNumberCalled: '+15551234567',
          startedAt: new Date().toISOString(),
        };
        expect(result.status).toBe(status);
      }
    });
  });

  describe('CallTranscriptEntry', () => {
    test('has role and message fields', () => {
      const entry: CallTranscriptEntry = {
        role: 'agent',
        message: 'Hello, this is a test.',
      };
      expect(entry.role).toBe('agent');
      expect(entry.message).toBe('Hello, this is a test.');
    });

    test('role is either agent or user', () => {
      const agentEntry: CallTranscriptEntry = { role: 'agent', message: 'Hi' };
      const userEntry: CallTranscriptEntry = { role: 'user', message: 'Hello' };
      expect(agentEntry.role).toBe('agent');
      expect(userEntry.role).toBe('user');
    });
  });

  describe('AnalysisResult', () => {
    test('has optional voicemailReasoning field', () => {
      const withReasoning: AnalysisResult = {
        id: 'test-1',
        createdAt: new Date().toISOString(),
        spec: {
          name: 'Test API',
          description: 'A test',
          version: '1.0.0',
          endpointCount: 1,
          endpoints: [{ path: '/test', method: 'GET' }],
        },
        company: {
          name: 'TestCo',
          url: 'https://test.com',
          painPoints: ['slow deploys'],
        },
        artifacts: [],
        demoPageUrl: 'https://demo.test.com',
        voicemailReasoning: 'Strong tech fit, decision-maker likely available',
      };
      expect(withReasoning.voicemailReasoning).toBe('Strong tech fit, decision-maker likely available');
    });

    test('voicemailReasoning is optional (can be undefined)', () => {
      const withoutReasoning: AnalysisResult = {
        id: 'test-2',
        createdAt: new Date().toISOString(),
        spec: {
          name: 'Test API',
          description: 'A test',
          version: '1.0.0',
          endpointCount: 0,
          endpoints: [],
        },
        company: {
          name: 'TestCo',
          url: 'https://test.com',
          painPoints: [],
        },
        artifacts: [],
        demoPageUrl: 'https://demo.test.com',
      };
      expect(withoutReasoning.voicemailReasoning).toBeUndefined();
    });
  });

  describe('CompanyResearch', () => {
    test('has optional phoneNumber field', () => {
      const company: CompanyResearch = {
        name: 'Acme Inc',
        url: 'https://acme.com',
        painPoints: ['manual processes'],
        phoneNumber: '+15559876543',
      };
      expect(company.phoneNumber).toBe('+15559876543');
    });

    test('phoneNumber is optional (can be undefined)', () => {
      const company: CompanyResearch = {
        name: 'Acme Inc',
        url: 'https://acme.com',
        painPoints: [],
      };
      expect(company.phoneNumber).toBeUndefined();
    });

    test('has all expected optional fields', () => {
      const company: CompanyResearch = {
        name: 'Full Co',
        url: 'https://full.com',
        logoUrl: 'https://full.com/logo.png',
        tagline: 'We do things',
        description: 'A full company',
        painPoints: ['scaling'],
        techStack: ['Node', 'React'],
        industry: 'SaaS',
        phoneNumber: '+15551112222',
      };
      expect(company.logoUrl).toBeDefined();
      expect(company.tagline).toBeDefined();
      expect(company.description).toBeDefined();
      expect(company.techStack).toEqual(['Node', 'React']);
      expect(company.industry).toBe('SaaS');
      expect(company.phoneNumber).toBeDefined();
    });
  });

  describe('OutreachArtifact', () => {
    test('includes voicemail-script as a valid type', () => {
      const artifact: OutreachArtifact = {
        type: 'voicemail-script',
        title: 'Voicemail for Acme',
        content: 'Hi, this is...',
      };
      expect(artifact.type).toBe('voicemail-script');
    });

    test('all artifact types are valid', () => {
      const types: OutreachArtifact['type'][] = [
        'cold-email',
        'demo-page',
        'value-prop',
        'linkedin-message',
        'voicemail-script',
      ];
      expect(types).toHaveLength(5);
      for (const type of types) {
        const artifact: OutreachArtifact = { type, title: 'Test', content: 'Content' };
        expect(artifact.type).toBe(type);
      }
    });

    test('has optional sentAt and viewedAt fields', () => {
      const artifact: OutreachArtifact = {
        type: 'cold-email',
        title: 'Intro email',
        content: 'Dear...',
        sentAt: '2026-03-20T10:00:00Z',
        viewedAt: '2026-03-20T11:00:00Z',
      };
      expect(artifact.sentAt).toBeDefined();
      expect(artifact.viewedAt).toBeDefined();
    });
  });
});
