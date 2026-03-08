'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { AnalysisResult } from '@/lib/types';

export default function DemoPage() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<number | null>(null);

  useEffect(() => {
    // Try API first, fall back to localStorage
    fetch(`/api/analyze?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          // Try localStorage
          const stored = localStorage.getItem('latest-result');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.id === id) {
              setResult(parsed);
              setLoading(false);
              return;
            }
          }
          setError(data.error);
        } else {
          setResult(data);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem('latest-result');
        if (stored) {
          try {
            setResult(JSON.parse(stored));
          } catch {
            setError('Failed to load demo');
          }
        }
      })
      .finally(() => setLoading(false));

    // Track demo page view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultId: id,
        companyUrl: '',
        eventType: 'demo_viewed',
      }),
    }).catch(() => {});
  }, [id]);

  const handleFeedback = async () => {
    if (!feedback.trim()) return;

    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultId: id,
        companyUrl: result?.company.url || '',
        eventType: 'feedback_submitted',
        metadata: { feedback },
      }),
    }).catch(() => {});

    setFeedbackSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Demo not found'}</p>
        </div>
      </div>
    );
  }

  const { company, spec } = result;
  const demoContent = result.artifacts.find(a => a.type === 'demo-page');
  const valueProp = result.artifacts.find(a => a.type === 'value-prop');

  // Get relevant endpoints (first 5)
  const relevantEndpoints = spec.endpoints.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero — branded for the target company */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-14 h-14 rounded-xl object-contain bg-slate-100 p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-sm text-slate-500 font-medium">Built for</h2>
                <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Powered by</p>
              <p className="text-lg font-semibold text-primary">{spec.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Personalized headline */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            How {spec.name} supercharges {company.name}
          </h1>
          {company.tagline && (
            <p className="text-lg text-slate-500 mb-6">{company.tagline}</p>
          )}
          {company.description && (
            <p className="text-slate-600 max-w-2xl mx-auto">{company.description}</p>
          )}
        </div>

        {/* Pain points → Solutions mapping */}
        {company.painPoints.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Your challenges. Our solutions.
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {company.painPoints.map((painPoint, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                    <span className="text-red-500 text-lg">⚡</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Challenge</h3>
                  <p className="text-slate-600 text-sm mb-4">{painPoint}</p>
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="font-semibold text-primary mb-1 text-sm">Solution</h3>
                    <p className="text-slate-500 text-xs">
                      {spec.name} endpoints handle this automatically →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Value proposition */}
        {valueProp && (
          <section className="mb-16 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Why {spec.name}?</h2>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {valueProp.content}
            </div>
          </section>
        )}

        {/* Try your first API call */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            Make your first API call in under a minute
          </h2>
          <p className="text-slate-500 text-center mb-8">
            Explore the endpoints most relevant to {company.name}
          </p>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
            {/* Endpoint tabs */}
            <div className="flex overflow-x-auto border-b border-slate-700">
              {relevantEndpoints.map((ep, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEndpoint(selectedEndpoint === i ? null : i)}
                  className={`px-4 py-3 text-sm font-mono whitespace-nowrap transition-colors ${
                    selectedEndpoint === i
                      ? 'bg-slate-800 text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`mr-2 text-xs font-bold ${
                    ep.method === 'GET' ? 'text-green-400' :
                    ep.method === 'POST' ? 'text-blue-400' :
                    ep.method === 'PUT' ? 'text-yellow-400' :
                    ep.method === 'DELETE' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {ep.method}
                  </span>
                  {ep.path}
                </button>
              ))}
            </div>

            {/* Endpoint detail */}
            <div className="p-6">
              {selectedEndpoint !== null && relevantEndpoints[selectedEndpoint] ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {relevantEndpoints[selectedEndpoint].summary || relevantEndpoints[selectedEndpoint].path}
                    </h3>
                    {relevantEndpoints[selectedEndpoint].description && (
                      <p className="text-slate-400 text-sm">
                        {relevantEndpoints[selectedEndpoint].description}
                      </p>
                    )}
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                    <p className="text-slate-500 mb-2"># Try it:</p>
                    <p className="text-green-400">
                      curl -X {relevantEndpoints[selectedEndpoint].method}{' '}
                      <span className="text-white">
                        {spec.baseUrl || 'https://api.example.com'}
                        {relevantEndpoints[selectedEndpoint].path}
                      </span>{' '}
                      \
                    </p>
                    <p className="text-white pl-4">
                      -H &quot;Authorization: Bearer YOUR_API_KEY&quot;
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  ← Select an endpoint to see how to get started
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Demo page content from agent */}
        {demoContent && (
          <section className="mb-16">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {demoContent.content}
              </div>
            </div>
          </section>
        )}

        {/* Feedback / Pain Point Survey */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              What&apos;s your biggest technical challenge right now?
            </h2>
            <p className="text-slate-500 mb-6">
              Help us understand how {spec.name} can best serve {company.name}
            </p>

            {feedbackSent ? (
              <div className="bg-green-50 text-green-700 rounded-lg p-4">
                ✓ Thanks for your feedback! We&apos;ll follow up with specific solutions.
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., We're struggling with real-time data sync between our services..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary resize-none h-24 mb-4"
                />
                <button
                  onClick={handleFeedback}
                  disabled={!feedback.trim()}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 transition-colors"
                >
                  Share Feedback
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-slate-400 text-sm">
        Personalized for {company.name} • Powered by {spec.name} + Claude Agent SDK
      </footer>
    </div>
  );
}
