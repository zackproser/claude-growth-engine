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
}

export interface OutreachArtifact {
  type: 'cold-email' | 'demo-page' | 'value-prop' | 'linkedin-message';
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
}

export interface TrackingEvent {
  resultId: string;
  companyUrl: string;
  eventType: 'page_view' | 'email_sent' | 'email_opened' | 'link_clicked' | 'demo_viewed' | 'feedback_submitted';
  metadata?: Record<string, string>;
  timestamp: string;
}
