'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import type { AnalysisResult } from '@/lib/types';

const CARD_EMOJIS = ['💰', '🔄', '🛒', '🔔', '📊', '⚡', '🔐', '📈', '🎯', '🚀'];

interface ParsedCard {
  headline: string;
  body: string;
  endpoint?: string;
}

/**
 * Clean markdown artifacts, backticks, stray formatting from agent text.
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*([^*]+)\*/g, '$1')        // *italic* → italic
    .replace(/`([^`]+)`/g, '$1')          // `code` → code
    .replace(/^#+\s*/gm, '')              // ## headers → text
    .replace(/^\d+\.\s*/gm, '')           // 1. numbered → text
    .replace(/^[-•]\s*/gm, '')            // - bullets → text
    .replace(/\s+/g, ' ')                 // collapse whitespace
    .trim();
}

function parseValueProp(content: string): ParsedCard[] {
  // Step 1: Clean ALL markdown from the content
  const clean = cleanMarkdown(content);

  // Step 2: Remove curl examples and "Make your first API call" CTAs
  const stripped = clean
    .replace(/Make your first API call[^.]*\./gi, '')
    .replace(/curl\s+-[^.]+\./g, '')
    .replace(/curl\s+https?:\/\/\S+[^.]*/g, '')
    .replace(/https?:\/\/api\.\S+/g, '')
    .trim();

  // Step 3: Extract all endpoints FIRST (before splitting destroys context)
  const allEndpoints = [...stripped.matchAll(/(GET|POST|PUT|DELETE|PATCH)\s+(\/[\w/{}\-]+)/g)];

  // Step 4: Split into sections. Try multiple strategies:
  // A) Numbered pain points: "1. "All my revenue..." → "2. "I need..."
  // B) Arrow separators: → between sections
  // C) Double newlines
  // D) Sentence boundaries

  let sections: string[] = [];

  // Strategy A: Numbered items like '1. "Pain point"' or 'Pain Point → Endpoint'
  const numberedPattern = /(?:^|\n)\d+\.\s*"[^"]+"/g;
  const numberedMatches = stripped.match(numberedPattern);

  if (numberedMatches && numberedMatches.length >= 3) {
    // Split around numbered pain points — each becomes a section with its solution
    const indices: number[] = [];
    let searchFrom = 0;
    for (const m of numberedMatches) {
      const idx = stripped.indexOf(m.trim(), searchFrom);
      if (idx >= 0) { indices.push(idx); searchFrom = idx + 1; }
    }
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i];
      const end = i + 1 < indices.length ? indices[i + 1] : stripped.length;
      sections.push(stripped.slice(start, end).trim());
    }
    // Also grab the intro before the first number
    if (indices[0] > 30) {
      sections.unshift(stripped.slice(0, indices[0]).trim());
    }
  }

  // Strategy B: Arrow-separated
  if (sections.length < 3) {
    const arrowParts = stripped.split(/\s*→\s*/);
    if (arrowParts.length >= 4) {
      sections = arrowParts.filter(s => s.length > 20);
    }
  }

  // Strategy C: Sentence-based (last resort)
  if (sections.length < 3) {
    sections = stripped
      .split(/(?<=\.)\s+(?=[A-Z])/)
      .filter(s => s.length > 30);
  }

  // Step 5: Build cards from sections
  const cards: ParsedCard[] = [];

  for (const section of sections) {
    // Find endpoints in this section
    const sectionEndpoints = [...section.matchAll(/(GET|POST|PUT|DELETE|PATCH)\s+(\/[\w/{}\-]+)/g)];
    const endpoint = sectionEndpoints.length > 0
      ? sectionEndpoints.map(m => `${m[1]} ${m[2]}`).join(' + ')
      : undefined;

    // Remove endpoints from display text
    let text = section
      .replace(/(GET|POST|PUT|DELETE|PATCH)\s+\/[\w/{}\-]+/g, '')
      .replace(/\+\s*\+/g, ' ')
      .replace(/^\s*[+,→]\s*/, '')
      .trim();

    // Skip very short or CTA-like sections
    if (text.length < 20) continue;
    if (/^Make your first/i.test(text)) continue;

    // Extract headline: first meaningful sentence, max 80 chars
    let headline = '';
    let body = '';

    // Try: text up to first period that's followed by more content
    const periodMatch = text.match(/^(.{20,80}?\.)\s+([\s\S]+)/);
    if (periodMatch) {
      headline = periodMatch[1];
      body = periodMatch[2];
    } else if (text.length <= 80) {
      headline = text;
      body = '';
    } else {
      // Break at em-dash, comma, or word boundary
      const dashIdx = text.indexOf(' — ');
      const commaIdx = text.indexOf(', ', 20);
      const breakAt = dashIdx > 15 && dashIdx < 70 ? dashIdx :
                      commaIdx > 15 && commaIdx < 70 ? commaIdx :
                      text.lastIndexOf(' ', 65);
      headline = text.slice(0, breakAt > 15 ? breakAt : 65).trim();
      body = text.slice(headline.length).replace(/^[\s,—]+/, '').trim();
    }

    // Clean stray leading punctuation
    headline = headline.replace(/^[→\-•"'\s]+/, '').replace(/["']$/, '').trim();
    body = body.replace(/^[→\-•"',\s]+/, '').trim();

    // Don't duplicate
    if (body.startsWith(headline)) {
      body = body.slice(headline.length).replace(/^[.:,—\s]+/, '').trim();
    }

    // Truncate body
    if (body.length > 220) {
      const cut = body.lastIndexOf('.', 220);
      body = body.slice(0, cut > 80 ? cut + 1 : 220).trim();
      if (!body.endsWith('.')) body += '…';
    }

    // Remove stray numbered prefixes from headline
    headline = headline.replace(/^\d+\.\s*/, '');

    if (headline.length >= 12) {
      cards.push({ headline, body, endpoint });
    }
  }

  // Dedupe cards with very similar headlines
  const unique: ParsedCard[] = [];
  for (const card of cards) {
    const isDupe = unique.some(u =>
      u.headline.slice(0, 30) === card.headline.slice(0, 30)
    );
    if (!isDupe) unique.push(card);
  }

  return unique;
}

function ValuePropCards({ content }: { content: string }) {
  const cards = parseValueProp(content);

  if (cards.length === 0) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
        <div className="prose prose-sm max-w-none text-slate-700">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all group">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
              {CARD_EMOJIS[i % CARD_EMOJIS.length]}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">{card.headline}</h3>
              {card.endpoint && (
                <code className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-mono mb-2 inline-block">
                  {card.endpoint.replace(/`/g, '')}
                </code>
              )}
              {card.body && (
                <p className="text-sm text-slate-500 leading-relaxed mt-1.5">{card.body}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const [copied, setCopied] = useState(false);
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
                    {/* Before — Current Pain Point */}
                    <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🩸</span>
                        <span className="text-sm font-bold text-red-600 uppercase tracking-wide">Current Pain Point</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{block.painPoint}</p>
                    </div>

                    {/* After — With API */}
                    <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✅</span>
                        <span className="text-sm font-bold text-green-700 uppercase tracking-wide">With {spec.name}</span>
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Why {spec.name}?</h2>
              <p className="text-slate-500">How each capability maps to your specific needs</p>
            </div>
            <ValuePropCards content={valueProp.content} />
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
                          onClick={() => setSelectedLang(key)}
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
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(langs[selectedLang].code);
                          trackEvent('lang_selected', { language: selectedLang, endpoint: ep.path });
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          copied
                            ? 'bg-green-500 text-white scale-105'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}>
                        {copied ? '✓ Copied!' : '📋 Copy Snippet'}
                      </button>
                      <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Get API Key →
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 bg-white placeholder-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none h-24 mb-4" />
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
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white placeholder-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
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
