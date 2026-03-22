export interface ParsedSpec {
  name: string;
  description: string;
  version: string;
  baseUrl?: string;
  endpointCount: number;
  endpoints: EndpointInfo[];
}

export interface EndpointInfo {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  operationId?: string;
}

export interface CompanyResearch {
  name: string;
  url: string;
  logoUrl?: string;
  tagline?: string;
  description?: string;
  painPoints: string[];
  techStack?: string[];
  industry?: string;
  phoneNumber?: string;
}

export interface OutreachArtifact {
  type: 'cold-email' | 'demo-page' | 'value-prop' | 'linkedin-message' | 'voicemail-script';
  title: string;
  content: string;
  sentAt?: string;
  viewedAt?: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  spec: ParsedSpec;
  company: CompanyResearch;
  artifacts: OutreachArtifact[];
  demoPageUrl: string;
  voicemailReasoning?: string;
}

export interface TrackingEvent {
  resultId: string;
  companyUrl: string;
  eventType: 'page_view' | 'email_sent' | 'email_opened' | 'link_clicked' | 'demo_viewed' | 'feedback_submitted' | 'api_playground' | 'time_on_page' | 'lang_selected' | 'voice_call_placed' | 'voicemail_delivered' | 'voicemail_listened';
  metadata?: Record<string, string>;
  timestamp: string;
}

export interface LeadScore {
  companyName: string;
  companyUrl: string;
  score: number; // 0-100
  temperature: 'hot' | 'warm' | 'cold';
  signals: string[];
  nextAction: string;
  nextActionDate: string;
  lastEngagement: string;
}

export type VoiceCallStatus = 'generating_script' | 'creating_agent' | 'placing_call' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer';

export interface VoiceCallResult {
  status: VoiceCallStatus;
  script: string;
  agentReasoning: string;
  callId?: string;
  conversationId?: string;
  elevenlabsAgentId?: string;
  phoneNumberCalled: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface AnalysisResultWithVoice extends AnalysisResult {
  voiceCall?: VoiceCallResult;
}
