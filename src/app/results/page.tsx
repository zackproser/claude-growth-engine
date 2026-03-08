'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { AnalysisResult, OutreachArtifact } from '@/lib/types';

function ArtifactCard({ artifact, resultId, onMarkSent }: {
  artifact: OutreachArtifact;
  resultId: string;
  onMarkSent: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const config: Record<string, { icon: string; label: string; color: string; actionLabel?: string }> = {
    'cold-email': { icon: '📧', label: 'Cold Email', color: 'border-primary/30 bg-primary/5', actionLabel: '✉️ Mark as Sent' },
    'demo-page': { icon: '🎯', label: 'Demo Page', color: 'border-accent/30 bg-accent/5' },
    'value-prop': { icon: '📊', label: 'Value Proposition', color: 'border-blue-500/30 bg-blue-500/5' },
    'linkedin-message': { icon: '💼', label: 'LinkedIn Message', color: 'border-purple-500/30 bg-purple-500/5', actionLabel: '✉️ Mark as Sent' },
  };

  const c = config[artifact.type] || { icon: '📄', label: artifact.title, color: 'border-neutral-700 bg-dark-alt' };

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
            <h3 className="text-base font-semibold text-text-light">{c.label}</h3>
            {artifact.sentAt && (
              <span className="text-xs text-green-400">✓ Sent {new Date(artifact.sentAt).toLocaleDateString()}</span>
            )}
            {artifact.viewedAt && (
              <span className="text-xs text-blue-400 ml-2">👁 Viewed {new Date(artifact.viewedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-md transition-colors"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          {artifact.type === 'demo-page' ? (
            <Link
              href={`/demo/${resultId}`}
              target="_blank"
              className="text-xs bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1.5 rounded-md transition-colors border border-accent/20"
            >
              🔗 View Demo Page
            </Link>
          ) : c.actionLabel && !artifact.sentAt ? (
            <button
              onClick={onMarkSent}
              className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-md transition-colors border border-primary/20"
            >
              {c.actionLabel}
            </button>
          ) : null}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1.5 transition-colors"
          >
            {expanded ? '▲ Collapse' : '▼ Preview'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 bg-dark rounded-lg p-4 text-sm text-neutral-300 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{artifact.content}</ReactMarkdown>
        </div>
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
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Result not found'}</p>
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
    <div className="bg-dark min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {result.company.logoUrl && (
              <img src={result.company.logoUrl} alt={result.company.name} className="w-14 h-14 rounded-xl object-contain bg-white p-1.5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-light">
                Outreach suite for <span className="text-primary">{result.company.name}</span>
              </h1>
              <p className="text-neutral-500 text-sm">
                Generated from {result.spec.name} • {result.spec.endpointCount} endpoints • {new Date(result.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {result.company.tagline && (
            <p className="text-neutral-400 text-sm italic mb-3">&ldquo;{result.company.tagline}&rdquo;</p>
          )}

          {/* Company intel chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {result.company.industry && (
              <span className="text-xs bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded-full">{result.company.industry}</span>
            )}
            {result.company.techStack?.map((tech, i) => (
              <span key={i} className="text-xs bg-blue-900/20 text-blue-400 px-2.5 py-1 rounded-full">{tech}</span>
            ))}
          </div>

          {/* Pain points */}
          {result.company.painPoints.length > 0 && (
            <div className="bg-red-900/10 border border-red-900/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs text-red-400 font-semibold mb-1.5">Identified Pain Points</p>
              <div className="flex flex-wrap gap-1.5">
                {result.company.painPoints.map((pp, i) => (
                  <span key={i} className="text-xs text-red-300 bg-red-900/20 px-2.5 py-0.5 rounded-full">{pp}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Artifact cards */}
        <div className="space-y-3 mb-10">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Your artifacts — ready to use</h2>
          {result.artifacts.map((artifact, i) => (
            <ArtifactCard
              key={i}
              artifact={artifact}
              resultId={result.id}
              onMarkSent={() => handleMarkSent(i)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-neutral-800">
          <Link href={`/demo/${result.id}`} target="_blank"
            className="bg-accent hover:bg-yellow-400 text-dark px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            🎯 Open Demo Page
          </Link>
          <Link href="/target"
            className="bg-neutral-800 hover:bg-neutral-700 text-text-light px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            🔄 Target Another Company
          </Link>
          <Link href="/upload"
            className="bg-neutral-800 hover:bg-neutral-700 text-text-light px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
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
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
