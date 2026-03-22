'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { AnalysisResult, OutreachArtifact, VoiceCallResult } from '@/lib/types';

function ArtifactCard({ artifact, resultId, onMarkSent }: {
  artifact: OutreachArtifact;
  resultId: string;
  onMarkSent: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const config: Record<string, { icon: string; label: string; color: string; actionLabel?: string }> = {
    'cold-email': { icon: '📧', label: 'Cold Email', color: 'border-anthropic-border bg-white', actionLabel: '✉️ Mark as Sent' },
    'demo-page': { icon: '🎯', label: 'Demo Page', color: 'border-anthropic-border bg-white' },
    'value-prop': { icon: '📊', label: 'Value Proposition', color: 'border-anthropic-border bg-white' },
    'linkedin-message': { icon: '💼', label: 'LinkedIn Message', color: 'border-anthropic-border bg-white', actionLabel: '✉️ Mark as Sent' },
    'voicemail-script': { icon: '📞', label: 'Voicemail Script', color: 'border-anthropic-border bg-white' },
  };

  const c = config[artifact.type] || { icon: '📄', label: artifact.title, color: 'border-anthropic-border bg-white' };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId, companyUrl: '', eventType: 'link_clicked', metadata: { action: 'copy', artifactType: artifact.type } }),
    }).catch(() => {});
  };

  return (
    <div className={`rounded-xl border p-5 transition-all ${c.color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{c.icon}</span>
          <div>
            <h3 className="text-base font-semibold text-text-dark">{c.label}</h3>
            {artifact.sentAt && (
              <span className="text-xs text-green-600">✓ Sent {new Date(artifact.sentAt).toLocaleDateString()}</span>
            )}
            {artifact.viewedAt && (
              <span className="text-xs text-blue-600 ml-2">👁 Viewed {new Date(artifact.viewedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {artifact.type !== 'demo-page' && (
            <button
              onClick={handleCopy}
              className="text-xs bg-light-alt hover:bg-warm-gray text-text-muted px-3 py-1.5 rounded-md transition-colors"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          )}
          {artifact.type === 'demo-page' ? (
            <Link
              href={`/demo/${resultId}`}
              target="_blank"
              className="text-xs bg-text-dark hover:bg-text-dark/90 text-white px-3 py-1.5 rounded-md transition-colors font-medium"
            >
              🎯 View Full Demo Page
            </Link>
          ) : (
            <>
              {c.actionLabel && !artifact.sentAt && (
                <button
                  onClick={onMarkSent}
                  className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-md transition-colors border border-primary/20"
                >
                  {c.actionLabel}
                </button>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-text-muted hover:text-text-dark px-2 py-1.5 transition-colors"
              >
                {expanded ? '▲ Collapse' : '▼ Preview'}
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 bg-cream rounded-lg p-4 text-sm text-text-muted prose prose-sm max-w-none">
          <ReactMarkdown>{artifact.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function VoiceCallStatusCard({ resultId }: { resultId: string }) {
  const [callData, setCallData] = useState<{ call: VoiceCallResult | null; agentDecisions: string[] } | null>(null);

  useEffect(() => {
    const fetchVoice = () => {
      fetch(`/api/voice?id=${resultId}`)
        .then(res => res.json())
        .then(data => setCallData(data))
        .catch(() => {});
    };
    fetchVoice();
    const interval = setInterval(fetchVoice, 5000);
    return () => clearInterval(interval);
  }, [resultId]);

  if (!callData?.call) return null;

  const { call, agentDecisions } = callData;
  const statusConfig: Record<string, { label: string; color: string; pulse?: boolean }> = {
    generating_script: { label: 'Generating voicemail...', color: 'text-yellow-600', pulse: true },
    creating_agent: { label: 'Setting up voice agent...', color: 'text-yellow-600', pulse: true },
    placing_call: { label: 'Placing call...', color: 'text-primary', pulse: true },
    ringing: { label: 'Ringing...', color: 'text-primary', pulse: true },
    in_progress: { label: 'Call in progress', color: 'text-green-600', pulse: true },
    completed: { label: 'Voicemail delivered', color: 'text-green-600' },
    failed: { label: 'Call failed', color: 'text-red-600' },
    no_answer: { label: 'No answer', color: 'text-gray-600' },
  };
  const status = statusConfig[call.status] || { label: call.status, color: 'text-gray-600' };

  return (
    <div className="bg-white border border-anthropic-border rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📞</span>
          <div>
            <h3 className="text-base font-semibold text-text-dark">Outbound Voice Call</h3>
            <div className="flex items-center gap-2">
              {status.pulse && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>
          </div>
        </div>
        <span className="text-xs text-text-muted font-mono">{call.phoneNumberCalled}</span>
      </div>

      {/* Script preview */}
      <div className="bg-cream rounded-lg p-3 mb-3 border border-anthropic-border">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Script</p>
        <p className="text-sm text-text-dark leading-relaxed">{call.script}</p>
      </div>

      {/* Agent reasoning */}
      {call.agentReasoning && (
        <div className="bg-light-alt rounded-lg p-3 mb-3 border border-anthropic-border">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Why this approach</p>
          <p className="text-sm text-text-dark leading-relaxed">{call.agentReasoning}</p>
        </div>
      )}

      {call.error && (
        <p className="text-xs text-red-600 mt-2">Error: {call.error}</p>
      )}

      {agentDecisions.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-text-muted cursor-pointer hover:text-text-dark">Agent decision log ({agentDecisions.length} entries)</summary>
          <div className="mt-2 space-y-1">
            {agentDecisions.map((d, i) => (
              <p key={i} className="text-xs text-text-muted font-mono">{d}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      const stored = localStorage.getItem('latest-result');
      if (stored) {
        try { setResult(JSON.parse(stored)); setLoading(false); return; } catch {}
      }
      setError('No result ID provided');
      setLoading(false);
      return;
    }

    fetch(`/api/analyze?id=${id}`)
      .then(res => res.json())
      .then(data => { if (data.error) setError(data.error); else setResult(data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Result not found'}</p>
          <Link href="/upload" className="text-primary hover:underline">← Start over</Link>
        </div>
      </div>
    );
  }

  const handleMarkSent = (index: number) => {
    const updated = { ...result };
    updated.artifacts[index].sentAt = new Date().toISOString();
    setResult(updated);
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: result.id, companyUrl: result.company.url, eventType: 'email_sent', metadata: { artifactType: result.artifacts[index].type } }),
    }).catch(() => {});
  };

  return (
    <div className="bg-cream min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {result.company.logoUrl && (
              <img src={result.company.logoUrl} alt={result.company.name} className="w-14 h-14 rounded-xl object-contain bg-white p-1.5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-dark">
                Outreach suite for <span className="text-primary">{result.company.name}</span>
              </h1>
              <p className="text-text-muted text-sm">
                Generated from {result.spec.name} • {result.spec.endpointCount} endpoints • {new Date(result.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {result.company.tagline && (
            <p className="text-text-muted text-sm italic mb-3">&ldquo;{result.company.tagline}&rdquo;</p>
          )}

          {/* Company intel chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {result.company.industry && (
              <span className="text-xs bg-light-alt text-text-muted px-2.5 py-1 rounded-full">{result.company.industry}</span>
            )}
            {result.company.techStack?.map((tech, i) => (
              <span key={i} className="text-xs bg-text-dark/5 text-text-dark px-2.5 py-1 rounded-full border border-anthropic-border">{tech}</span>
            ))}
          </div>

          {/* Pain points */}
          {result.company.painPoints.length > 0 && (
            <div className="bg-white border border-anthropic-border rounded-xl px-5 py-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <p className="text-sm text-primary font-bold uppercase tracking-wide">Identified Pain Points</p>
              </div>
              <div className="space-y-2">
                {result.company.painPoints.map((pp, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5 text-xs">●</span>
                    <p className="text-sm text-text-dark leading-relaxed">{pp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Artifact cards */}
        <div className="space-y-3 mb-10">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Your artifacts — ready to use</h2>
          {result.artifacts.map((artifact, i) => (
            <ArtifactCard
              key={i}
              artifact={artifact}
              resultId={result.id}
              onMarkSent={() => handleMarkSent(i)}
            />
          ))}
        </div>

        {/* Voice call status */}
        <VoiceCallStatusCard resultId={result.id} />

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-anthropic-border">
          <Link href={`/demo/${result.id}`} target="_blank"
            className="bg-text-dark hover:bg-text-dark/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            🎯 Open Demo Page
          </Link>
          <Link href="/target"
            className="bg-light-alt hover:bg-light-alt text-text-dark px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            🔄 Target Another Company
          </Link>
          <Link href="/upload"
            className="bg-light-alt hover:bg-light-alt text-text-dark px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            📄 New API Spec
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
