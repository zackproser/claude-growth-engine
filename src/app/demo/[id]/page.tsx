'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
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
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetch(`/api/analyze?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          const stored = localStorage.getItem('latest-result');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.id === id) { setResult(parsed); setLoading(false); return; }
          }
          setError(data.error);
        } else {
          setResult(data);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem('latest-result');
        if (stored) { try { setResult(JSON.parse(stored)); } catch { setError('Failed to load demo'); } }
      })
      .finally(() => setLoading(false));

    // Track view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: id, companyUrl: '', eventType: 'demo_viewed' }),
    }).catch(() => {});

    // Track time on page
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      if (seconds === 120) {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resultId: id, companyUrl: '', eventType: 'time_on_page', metadata: { seconds: '120' } }),
        }).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [id, startTime]);

  const trackEndpointClick = (endpoint: string) => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: id, companyUrl: '', eventType: 'api_playground', metadata: { endpoint } }),
    }).catch(() => {});
  };

  const handleFeedback = async () => {
    if (!feedback.trim()) return;
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: id, companyUrl: result?.company.url || '', eventType: 'feedback_submitted', metadata: { feedback } }),
    }).catch(() => {});
    setFeedbackSent(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (error || !result) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-red-500">{error || 'Demo not found'}</p>
    </div>;
  }

  const { company, spec } = result;
  const demoContent = result.artifacts.find(a => a.type === 'demo-page');
  const valueProp = result.artifacts.find(a => a.type === 'value-prop');
  const relevantEndpoints = spec.endpoints.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name}
                className="w-12 h-12 rounded-xl object-contain bg-slate-100 p-1.5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-bold">
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Built for</p>
              <h1 className="text-xl font-bold text-slate-900">{company.name}</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Powered by</p>
            <p className="text-base font-semibold text-primary">{spec.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {spec.name} × {company.name}
          </h1>
          {company.description && (
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{company.description}</p>
          )}
        </div>

        {/* Pain points → Solutions */}
        {company.painPoints.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your challenges. Our solutions.</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {company.painPoints.map((pp, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-xs text-red-500 font-semibold uppercase">Challenge</span>
                  </div>
                  <p className="text-slate-700 text-sm">{pp}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Value prop */}
        {valueProp && (
          <section className="mb-14 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Why {spec.name}?</h2>
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown>{valueProp.content}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* API Playground */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Make your first API call</h2>
          <p className="text-slate-500 text-center mb-6 text-sm">Click an endpoint to see how to get started</p>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex overflow-x-auto border-b border-slate-700">
              {relevantEndpoints.map((ep, i) => (
                <button key={i}
                  onClick={() => { setSelectedEndpoint(selectedEndpoint === i ? null : i); trackEndpointClick(ep.path); }}
                  className={`px-4 py-3 text-xs font-mono whitespace-nowrap transition-colors ${
                    selectedEndpoint === i ? 'bg-slate-800 text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'
                  }`}>
                  <span className={`mr-1.5 font-bold ${
                    ep.method === 'GET' ? 'text-green-400' : ep.method === 'POST' ? 'text-blue-400' :
                    ep.method === 'PUT' || ep.method === 'PATCH' ? 'text-yellow-400' : ep.method === 'DELETE' ? 'text-red-400' : 'text-slate-400'
                  }`}>{ep.method}</span>
                  {ep.path}
                </button>
              ))}
            </div>
            <div className="p-6">
              {selectedEndpoint !== null && relevantEndpoints[selectedEndpoint] ? (
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {relevantEndpoints[selectedEndpoint].summary || relevantEndpoints[selectedEndpoint].path}
                  </h3>
                  {relevantEndpoints[selectedEndpoint].description && (
                    <p className="text-slate-400 text-sm mb-4">{relevantEndpoints[selectedEndpoint].description}</p>
                  )}
                  <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                    <p className="text-slate-500 mb-1"># Try it:</p>
                    <p className="text-green-400">
                      curl -X {relevantEndpoints[selectedEndpoint].method}{' '}
                      <span className="text-white">{spec.baseUrl || 'https://api.example.com'}{relevantEndpoints[selectedEndpoint].path}</span> \
                    </p>
                    <p className="text-white pl-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot;</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6">← Select an endpoint above</p>
              )}
            </div>
          </div>
        </section>

        {/* Agent-generated demo content is already represented in the structured sections above.
             The raw demo-page artifact is intentionally NOT rendered here to avoid duplication. */}

        {/* Feedback survey */}
        <section className="mb-14">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">What&apos;s your biggest technical challenge?</h2>
            <p className="text-slate-500 text-sm mb-6">Help us understand how {spec.name} can best serve {company.name}</p>
            {feedbackSent ? (
              <div className="bg-green-50 text-green-700 rounded-lg p-4">✓ Thanks! We&apos;ll follow up with specific solutions.</div>
            ) : (
              <div className="max-w-lg mx-auto">
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., We're struggling with real-time billing sync..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary resize-none h-24 mb-4" />
                <button onClick={handleFeedback} disabled={!feedback.trim()}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-slate-300 transition-colors">
                  Share Feedback
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-slate-400 text-xs">
        Personalized for {company.name} • Powered by {spec.name} + Claude Agent SDK
      </footer>
    </div>
  );
}
