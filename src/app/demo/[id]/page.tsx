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
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
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
        } else { setResult(data); }
      })
      .catch(() => {
        const stored = localStorage.getItem('latest-result');
        if (stored) { try { setResult(JSON.parse(stored)); } catch { setError('Failed to load'); } }
      })
      .finally(() => setLoading(false));

    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: id, companyUrl: '', eventType: 'demo_viewed' }),
    }).catch(() => {});

    // Track time on page at 2 min
    const timer = setTimeout(() => {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: id, companyUrl: '', eventType: 'time_on_page', metadata: { seconds: '120' } }),
      }).catch(() => {});
    }, 120000);
    return () => clearTimeout(timer);
  }, [id, startTime]);

  const trackEvent = (eventType: string, metadata?: Record<string, string>) => {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId: id, companyUrl: result?.company.url || '', eventType, metadata }),
    }).catch(() => {});
  };

  const handleFeedback = async () => {
    if (!feedback.trim()) return;
    trackEvent('feedback_submitted', { feedback });
    setFeedbackSent(true);
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { from: 'user', text: msg }]);
    setChatInput('');
    trackEvent('feedback_submitted', { chat_message: msg });
    // Simulated response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: 'bot', text: `Thanks for your question about "${msg}". Our team will follow up with a personalized answer within 24 hours.` }]);
    }, 800);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !result) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-red-500">{error || 'Demo not found'}</p></div>;

  const { company, spec } = result;
  const valueProp = result.artifacts.find(a => a.type === 'value-prop');
  const relevantEndpoints = spec.endpoints.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-8">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-16 h-16 rounded-2xl object-contain bg-white/10 p-2 backdrop-blur"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-2xl font-bold">
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">Built for</p>
              <h1 className="text-3xl font-bold">{company.name}</h1>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-slate-400">Powered by</p>
              <p className="text-xl font-bold text-orange-400">{spec.name}</p>
            </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            {spec.name} × {company.name}
          </h2>
          {company.description && (
            <p className="text-lg text-slate-300 max-w-2xl mb-6">{company.description}</p>
          )}
          {company.tagline && (
            <p className="text-slate-400 italic">&ldquo;{company.tagline}&rdquo;</p>
          )}

          {/* Stats bar */}
          <div className="flex gap-8 mt-8 pt-8 border-t border-slate-700">
            <div>
              <p className="text-2xl font-bold text-orange-400">{spec.endpointCount}</p>
              <p className="text-xs text-slate-400 uppercase">Endpoints</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{company.painPoints.length}</p>
              <p className="text-xs text-slate-400 uppercase">Pain Points Identified</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">&lt;1 min</p>
              <p className="text-xs text-slate-400 uppercase">To First API Call</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6">
        {/* Pain Points */}
        {company.painPoints.length > 0 && (
          <section className="py-14 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your challenges</h2>
            <p className="text-slate-500 mb-6">We identified these from analyzing {company.name}&apos;s public presence</p>
            <div className="grid md:grid-cols-3 gap-4">
              {company.painPoints.map((pp, i) => (
                <div key={i} className="group relative bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <p className="text-slate-700 text-sm leading-relaxed pr-8">{pp}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-orange-500 font-semibold">{spec.name} solves this →</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Value Prop */}
        {valueProp && (
          <section className="py-14 border-b border-slate-200">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Why {spec.name}?</h2>
              <div className="prose prose-slate prose-sm max-w-none">
                <ReactMarkdown>{valueProp.content}</ReactMarkdown>
              </div>
            </div>
          </section>
        )}

        {/* API Playground */}
        <section className="py-14 border-b border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Make your first API call</h2>
            <p className="text-slate-500">Click an endpoint to see how it works for {company.name}</p>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex overflow-x-auto border-b border-slate-700/50 bg-slate-800/50">
              {relevantEndpoints.map((ep, i) => (
                <button key={i}
                  onClick={() => { setSelectedEndpoint(i); trackEvent('api_playground', { endpoint: ep.path }); }}
                  className={`px-4 py-3 text-xs font-mono whitespace-nowrap transition-all ${
                    selectedEndpoint === i ? 'bg-slate-900 text-white border-b-2 border-orange-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}>
                  <span className={`mr-1.5 font-bold ${
                    ep.method === 'GET' ? 'text-green-400' : ep.method === 'POST' ? 'text-blue-400' :
                    ep.method === 'PATCH' || ep.method === 'PUT' ? 'text-yellow-400' : ep.method === 'DELETE' ? 'text-red-400' : ''
                  }`}>{ep.method}</span>
                  {ep.path}
                </button>
              ))}
            </div>
            <div className="p-6">
              {relevantEndpoints[selectedEndpoint] && (
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {relevantEndpoints[selectedEndpoint].summary || relevantEndpoints[selectedEndpoint].path}
                  </h3>
                  {relevantEndpoints[selectedEndpoint].description && (
                    <p className="text-slate-400 text-sm mb-5">{relevantEndpoints[selectedEndpoint].description}</p>
                  )}
                  <div className="bg-slate-800 rounded-xl p-5 font-mono text-sm border border-slate-700">
                    <p className="text-slate-500 mb-2"># Try it now:</p>
                    <p className="text-green-400">
                      curl -X {relevantEndpoints[selectedEndpoint].method}{' '}
                      <span className="text-white">{spec.baseUrl || 'https://api.example.com'}{relevantEndpoints[selectedEndpoint].path}</span> \
                    </p>
                    <p className="text-white pl-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \</p>
                    <p className="text-white pl-4">-H &quot;Content-Type: application/json&quot;</p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Get API Key →
                    </button>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      View Full Docs
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Feedback Survey */}
        <section className="py-14 border-b border-slate-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">What&apos;s your biggest technical challenge?</h2>
            <p className="text-slate-500 text-sm mb-6">Help us tailor {spec.name} for {company.name}</p>
            {feedbackSent ? (
              <div className="bg-green-50 text-green-700 rounded-xl p-5 border border-green-200">
                ✓ Thanks! We&apos;ll follow up with specific solutions for {company.name}.
              </div>
            ) : (
              <div>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., We need real-time billing sync across 3 payment providers..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none h-24 mb-4" />
                <button onClick={handleFeedback} disabled={!feedback.trim()}
                  className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">
                  Share Feedback
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <details className="group">
          <summary className="list-none cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 flex items-center justify-center text-white text-xl transition-all hover:scale-110">
              💬
            </div>
          </summary>
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3">
              <p className="font-semibold text-sm">Ask us anything</p>
              <p className="text-xs text-slate-400">Questions logged for our team</p>
            </div>
            <div className="h-52 overflow-y-auto p-3 space-y-2 bg-slate-50">
              {chatMessages.length === 0 && (
                <p className="text-slate-400 text-xs text-center mt-8">Ask a question about {spec.name} for {company.name}</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                    msg.from === 'user' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-700'
                  }`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-slate-200 flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Type a question..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
              <button onClick={handleChat} disabled={!chatInput.trim()}
                className="bg-orange-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">
                Send
              </button>
            </div>
          </div>
        </details>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center">
        <p className="text-slate-400 text-sm">Personalized for {company.name}</p>
        <p className="text-slate-300 text-xs mt-1">Powered by {spec.name} + Claude Agent SDK</p>
      </footer>
    </div>
  );
}
