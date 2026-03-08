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
  const [selectedLang, setSelectedLang] = useState('curl');
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
        {/* Before → After Story Blocks */}
        <section className="py-14 border-b border-slate-200">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">How {spec.name} transforms {company.name}</h2>
            <p className="text-slate-500">Each challenge mapped to a solution — with the API call to prove it</p>
          </div>

          <div className="space-y-8">
            {(() => {
              // Try to parse story blocks from demo-page artifact
              const demoArtifact = result.artifacts.find(a => a.type === 'demo-page');
              let storyBlocks: Array<{ painPoint: string; solution: string; endpointPath?: string; endpointMethod?: string; exampleRequest?: string; exampleResponse?: string }> = [];
              
              if (demoArtifact) {
                try {
                  const parsed = JSON.parse(demoArtifact.content);
                  if (Array.isArray(parsed)) storyBlocks = parsed;
                } catch {
                  // Fallback: use pain points + endpoints as simple interleave
                }
              }

              // Fallback if agent didn't return structured blocks
              if (storyBlocks.length === 0 && company.painPoints.length > 0) {
                storyBlocks = company.painPoints.slice(0, 5).map((pp, i) => ({
                  painPoint: pp,
                  solution: `${spec.name} handles this through its ${spec.endpoints[i]?.path || 'API'} endpoint`,
                  endpointPath: spec.endpoints[i]?.path,
                  endpointMethod: spec.endpoints[i]?.method,
                }));
              }

              return storyBlocks.map((block, i) => (
                <div key={i} className="relative">
                  {/* Connector line */}
                  {i < storyBlocks.length - 1 && (
                    <div className="absolute left-8 top-full h-8 w-0.5 bg-slate-200 z-0" />
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="bg-red-50 rounded-xl border border-red-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">✗</span>
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Before</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{block.painPoint}</p>
                    </div>

                    {/* After */}
                    <div className="bg-green-50 rounded-xl border border-green-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">After</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{block.solution}</p>
                    </div>
                  </div>

                  {/* API Call Proof */}
                  {(block.endpointPath || block.exampleRequest) && (
                    <div className="mt-3 bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                      {block.exampleRequest ? (
                        <pre className="text-green-400 whitespace-pre-wrap">{block.exampleRequest}</pre>
                      ) : (
                        <p className="text-green-400">
                          curl -X {block.endpointMethod || 'GET'}{' '}
                          <span className="text-white">{spec.baseUrl || 'https://api.example.com'}{block.endpointPath}</span>{' '}
                          -H &quot;Authorization: Bearer YOUR_KEY&quot;
                        </p>
                      )}
                      {block.exampleResponse && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <p className="text-slate-500 mb-1"># Response:</p>
                          <pre className="text-amber-300 whitespace-pre-wrap">{block.exampleResponse}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        </section>

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
            <p className="text-slate-500">Click an endpoint, pick your language — we&apos;ll track your preference</p>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Endpoint tabs */}
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
              {relevantEndpoints[selectedEndpoint] && (() => {
                const ep = relevantEndpoints[selectedEndpoint];
                const base = spec.baseUrl || 'https://api.example.com';
                const url = `${base}${ep.path}`;
                const langs: Record<string, { label: string; icon: string; code: string }> = {
                  curl: { label: 'cURL', icon: '⌘', code: `curl -X ${ep.method} "${url}" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"` },
                  python: { label: 'Python', icon: '🐍', code: `import requests\n\nresponse = requests.${ep.method.toLowerCase()}(\n    "${url}",\n    headers={\n        "Authorization": "Bearer YOUR_API_KEY",\n        "Content-Type": "application/json"\n    }\n)\nprint(response.json())` },
                  node: { label: 'Node.js', icon: '🟢', code: `const response = await fetch("${url}", {\n  method: "${ep.method}",\n  headers: {\n    "Authorization": "Bearer YOUR_API_KEY",\n    "Content-Type": "application/json"\n  }\n});\nconst data = await response.json();` },
                  go: { label: 'Go', icon: '🔵', code: `req, _ := http.NewRequest("${ep.method}", "${url}", nil)\nreq.Header.Set("Authorization", "Bearer YOUR_API_KEY")\nreq.Header.Set("Content-Type", "application/json")\nresp, _ := http.DefaultClient.Do(req)` },
                  ruby: { label: 'Ruby', icon: '💎', code: `require 'net/http'\nrequire 'json'\n\nuri = URI("${url}")\nreq = Net::HTTP::${ep.method === 'GET' ? 'Get' : ep.method === 'POST' ? 'Post' : ep.method === 'PUT' ? 'Put' : ep.method === 'DELETE' ? 'Delete' : 'Get'}.new(uri)\nreq["Authorization"] = "Bearer YOUR_API_KEY"\nres = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }\nputs JSON.parse(res.body)` },
                };

                return (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {ep.summary || ep.path}
                    </h3>
                    {ep.description && (
                      <p className="text-slate-400 text-sm mb-4">{ep.description}</p>
                    )}

                    {/* Language tabs */}
                    <div className="flex gap-1 mb-3">
                      {Object.entries(langs).map(([key, lang]) => (
                        <button key={key}
                          onClick={() => { setSelectedLang(key); trackEvent('lang_selected', { language: key, endpoint: ep.path }); }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            selectedLang === key ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}>
                          <span className="mr-1">{lang.icon}</span>{lang.label}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-800 rounded-xl p-5 font-mono text-sm border border-slate-700 overflow-x-auto">
                      <pre className="text-green-400 whitespace-pre">{langs[selectedLang].code}</pre>
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
                );
              })()}
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
