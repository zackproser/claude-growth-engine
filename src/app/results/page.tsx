'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { AnalysisResult, OutreachArtifact } from '@/lib/types';

function ArtifactCard({ artifact, resultId }: { artifact: OutreachArtifact; resultId: string }) {
  const [copied, setCopied] = useState(false);
  const [markedSent, setMarkedSent] = useState(!!artifact.sentAt);

  const iconMap: Record<string, string> = {
    'cold-email': '📧',
    'demo-page': '🎯',
    'value-prop': '📊',
    'linkedin-message': '💼',
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultId,
        companyUrl: '',
        eventType: 'link_clicked',
        metadata: { action: 'copy', artifactType: artifact.type },
      }),
    }).catch(() => {});
  };

  const handleMarkSent = async () => {
    setMarkedSent(true);
    artifact.sentAt = new Date().toISOString();

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultId,
        companyUrl: '',
        eventType: 'email_sent',
        metadata: { artifactType: artifact.type },
      }),
    }).catch(() => {});
  };

  return (
    <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-text-light flex items-center">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 text-sm">
            {iconMap[artifact.type] || '📄'}
          </span>
          {artifact.title}
        </h3>
        <div className="flex items-center gap-2">
          {(markedSent || artifact.sentAt) && (
            <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded">
              ✓ Sent {new Date(artifact.sentAt || Date.now()).toLocaleDateString()}
            </span>
          )}
          {artifact.viewedAt && (
            <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">
              👁 Viewed {new Date(artifact.viewedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="bg-dark rounded-lg p-5 text-neutral-300 leading-relaxed whitespace-pre-wrap text-sm">
        {artifact.content}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleCopy}
          className="bg-neutral-700 hover:bg-neutral-600 text-text-light px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        {(artifact.type === 'cold-email' || artifact.type === 'linkedin-message') && !markedSent && (
          <button
            onClick={handleMarkSent}
            className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-primary/30"
          >
            ✉️ Mark as Sent
          </button>
        )}
        {artifact.type === 'demo-page' && (
          <Link
            href={`/demo/${resultId}`}
            className="bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-accent/30"
          >
            🔗 View Demo Page
          </Link>
        )}
      </div>
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
        try {
          setResult(JSON.parse(stored));
          setLoading(false);
          return;
        } catch { /* empty */ }
      }
      setError('No result ID provided');
      setLoading(false);
      return;
    }

    fetch(`/api/analyze?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          // Fall back to localStorage
          const stored = localStorage.getItem('latest-result');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.id === id) {
                setResult(parsed);
                return;
              }
            } catch { /* empty */ }
          }
          setError(data.error);
        } else {
          setResult(data);
        }
      })
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

  return (
    <div className="bg-dark min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-light mb-4">Outreach Suite Ready ✨</h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            {result.company.logoUrl && (
              <img
                src={result.company.logoUrl}
                alt={result.company.name}
                className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div>
              <p className="text-xl text-primary font-semibold">{result.company.name}</p>
              {result.company.tagline && (
                <p className="text-neutral-400 text-sm">{result.company.tagline}</p>
              )}
            </div>
          </div>
          <p className="text-neutral-300">
            Generated from <span className="text-accent">{result.spec.name}</span> API
            {' '}• {result.spec.endpointCount} endpoints analyzed
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            Created {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Company Research Summary */}
        <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-text-light mb-3">Company Research</h2>
          {result.company.description && (
            <p className="text-neutral-300 mb-3">{result.company.description}</p>
          )}
          {result.company.industry && (
            <p className="text-neutral-400 text-sm mb-3">
              <span className="text-neutral-500">Industry:</span> {result.company.industry}
            </p>
          )}
          {result.company.painPoints.length > 0 && (
            <div className="mb-3">
              <p className="text-neutral-500 text-sm mb-2">Identified Pain Points:</p>
              <div className="flex flex-wrap gap-2">
                {result.company.painPoints.map((pp, i) => (
                  <span key={i} className="bg-red-900/20 text-red-400 px-3 py-1 rounded-full text-xs">
                    {pp}
                  </span>
                ))}
              </div>
            </div>
          )}
          {result.company.techStack && result.company.techStack.length > 0 && (
            <div>
              <p className="text-neutral-500 text-sm mb-2">Tech Stack:</p>
              <div className="flex flex-wrap gap-2">
                {result.company.techStack.map((tech, i) => (
                  <span key={i} className="bg-blue-900/20 text-blue-400 px-3 py-1 rounded-full text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Artifacts */}
        <div className="space-y-6">
          {result.artifacts.map((artifact, i) => (
            <ArtifactCard key={i} artifact={artifact} resultId={result.id} />
          ))}
        </div>

        {/* Actions */}
        <div className="text-center mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href={`/demo/${result.id}`}
            className="bg-accent text-dark px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            🎯 View Demo Page
          </Link>
          <Link
            href="/target"
            className="bg-neutral-700 hover:bg-neutral-600 text-text-light px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🔄 Target Another Company
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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
