'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EndpointInfo {
  path: string;
  method: string;
  summary?: string;
  description?: string;
}

interface ParsedSpec {
  name: string;
  description: string;
  version: string;
  baseUrl?: string;
  endpointCount: number;
  endpoints: EndpointInfo[];
}

interface ProgressStep {
  step: string;
  detail?: string;
  done?: boolean;
  timestamp: number;
}

function ClaudeStepIcon({ active, done, size = 20 }: { active?: boolean; done?: boolean; size?: number }) {
  return (
    <div className={`relative flex-shrink-0 ${active ? 'animate-spin' : ''}`} style={{ width: size, height: size, ...(active ? { animationDuration: '2s' } : {}) }}>
      <svg viewBox="0 0 248 248" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: size }}>
        <path d="M52.4285 162.873L98.7844 136.879L99.5485 134.602L98.7844 133.334H96.4921L88.7237 132.862L62.2346 132.153L39.3113 131.207L17.0249 130.026L11.4214 128.844L6.2 121.873L6.7094 118.447L11.4214 115.257L18.171 115.847L33.0711 116.911L55.485 118.447L71.6586 119.392L95.728 121.873H99.5485L100.058 120.337L98.7844 119.392L97.7656 118.447L74.5877 102.732L49.4995 86.1905L36.3823 76.62L29.3779 71.7757L25.8121 67.2858L24.2839 57.3608L30.6515 50.2716L39.3113 50.8623L41.4763 51.4531L50.2636 58.1879L68.9842 72.7209L93.4357 90.6804L97.0015 93.6343L98.4374 92.6652L98.6571 91.9801L97.0015 89.2625L83.757 65.2772L69.621 40.8192L63.2534 30.6579L61.5978 24.632C60.9565 22.1032 60.579 20.0111 60.579 17.4246L67.8381 7.49965L71.9133 6.19995L81.7193 7.49965L85.7946 11.0443L91.9074 24.9865L101.714 46.8451L116.996 76.62L121.453 85.4816L123.873 93.6343L124.764 96.1155H126.292V94.6976L127.566 77.9197L129.858 57.3608L132.15 30.8942L132.915 23.4505L136.608 14.4708L143.994 9.62643L149.725 12.344L154.437 19.0788L153.8 23.4505L150.998 41.6463L145.522 70.1215L141.957 89.2625H143.994L146.414 86.7813L156.093 74.0206L172.266 53.698L179.398 45.6635L187.803 36.802L193.152 32.5484H203.34L210.726 43.6549L207.415 55.1159L196.972 68.3492L188.312 79.5739L175.896 96.2095L168.191 109.585L168.882 110.689L170.738 110.53L198.755 104.504L213.91 101.787L231.994 98.7149L240.144 102.496L241.036 106.395L237.852 114.311L218.495 119.037L195.826 123.645L162.07 131.592L161.696 131.893L162.137 132.547L177.36 133.925L183.855 134.279H199.774L229.447 136.524L237.215 141.605L241.8 147.867L241.036 152.711L229.065 158.737L213.019 154.956L175.45 145.977L162.587 142.787H160.805V143.85L171.502 154.366L191.242 172.089L215.82 195.011L217.094 200.682L213.91 205.172L210.599 204.699L188.949 188.394L180.544 181.069L161.696 165.118H160.422V166.772L164.752 173.152L187.803 207.771L188.949 218.405L187.294 221.832L181.308 223.959L174.813 222.777L161.187 203.754L147.305 182.486L136.098 163.345L134.745 164.2L128.075 235.42L125.019 239.082L117.887 241.8L111.902 237.31L108.718 229.984L111.902 215.452L115.722 196.547L118.779 181.541L121.58 162.873L123.291 156.636L123.14 156.219L121.773 156.449L107.699 175.752L86.304 204.699L69.3663 222.777L65.291 224.431L58.2867 220.768L58.9235 214.27L62.8713 208.48L86.304 178.705L100.44 160.155L109.551 149.507L109.462 147.967L108.959 147.924L46.6977 188.512L35.6182 189.93L30.7788 185.44L31.4156 178.115L33.7079 175.752L52.4285 162.873Z"
          fill={done ? '#10B981' : '#D97757'}
          className={done ? '' : (active ? 'opacity-100' : 'opacity-40')}
        />
      </svg>
    </div>
  );
}

export default function TargetPage() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [parsedSpec, setParsedSpec] = useState<ParsedSpec | null>(null);
  const [rawSpec, setRawSpec] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('openapi-spec');
    if (stored) {
      try {
        const { parsed, raw } = JSON.parse(stored);
        setParsedSpec(parsed);
        setRawSpec(raw);
      } catch {
        router.push('/upload');
      }
    } else {
      router.push('/upload');
    }
  }, [router]);

  // Auto-scroll steps
  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  // Elapsed timer
  useEffect(() => {
    if (isAnalyzing) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!companyUrl.trim()) return;

    setIsAnalyzing(true);
    setError('');
    setSteps([{ step: 'Connecting to Claude Agent SDK...', timestamp: Date.now() }]);

    const normalizedUrl = companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSpec,
          targetUrl: normalizedUrl,
          stream: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Analysis failed');
        setIsAnalyzing(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setError('Streaming not supported');
        setIsAnalyzing(false);
        return;
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              if (currentEvent === 'progress') {
                setSteps(prev => [...prev, {
                  step: parsed.detail || parsed.step,
                  detail: parsed.detail,
                  done: parsed.done,
                  timestamp: Date.now(),
                }]);
              } else if (currentEvent === 'result') {
                // Store result and navigate
                localStorage.setItem('latest-result', JSON.stringify(parsed));
                setSteps(prev => [...prev, {
                  step: '✅ Outreach suite ready — redirecting...',
                  done: true,
                  timestamp: Date.now(),
                }]);
                setTimeout(() => router.push(`/results?id=${parsed.id}`), 800);
                return;
              } else if (currentEvent === 'error') {
                setError(parsed.error || 'Analysis failed');
                setIsAnalyzing(false);
                return;
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      }

      // If we get here without a result event, something went wrong
      if (!error) {
        setError('Stream ended without a result');
        setIsAnalyzing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze target');
      setIsAnalyzing(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="mb-8">
            <div className="mx-auto mb-4 flex justify-center">
              <ClaudeStepIcon active size={64} />
            </div>
            <h2 className="text-2xl font-semibold text-text-dark mb-4">Claude Agent is Working</h2>

            {/* Context row */}
            <div className="bg-white border border-anthropic-border rounded-lg px-5 py-3 mb-3 text-sm text-text-muted inline-flex items-center gap-6">
              <span>
                <span className="text-text-muted">Target</span>{' '}
                <span className="text-primary font-medium">{companyUrl.replace(/^https?:\/\//, '')}</span>
              </span>
              <span className="w-px h-4 bg-anthropic-border" />
              <span>
                <span className="text-text-muted">API</span>{' '}
                <span className="text-primary font-medium">{parsedSpec?.name}</span>
              </span>
              <span className="w-px h-4 bg-anthropic-border" />
              <span className="text-text-dark font-medium">{parsedSpec?.endpointCount} endpoints</span>
            </div>

            {/* Capabilities row */}
            <div className="flex items-center justify-center gap-4 text-xs text-text-muted mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Claude Agent SDK
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live analysis
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                Voice outreach
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                5 artifacts
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-anthropic-border max-h-80 overflow-y-auto">
            <div className="space-y-2 text-left">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start space-x-3 animate-fadeIn">
                  <span className="flex-shrink-0 mt-0.5">
                    {i < steps.length - 1 || s.done ? (
                      <span className="text-green-500 text-base">✓</span>
                    ) : (
                      <ClaudeStepIcon active />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm block ${
                      i === steps.length - 1 && !s.done ? 'text-text-dark font-medium' : 'text-text-muted'
                    }`}>
                      {s.step}
                    </span>
                    {i < steps.length - 1 && steps[i + 1] && (
                      <span className="text-xs text-text-muted">
                        {((steps[i + 1].timestamp - s.timestamp) / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={stepsEndRef} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-white text-text-muted border border-anthropic-border tabular-nums">
              {elapsedSeconds}s elapsed
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white text-text-muted border border-anthropic-border">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Every step is a real Anthropic API call
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!parsedSpec) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-dark mb-4">
            Choose Your Target Company
          </h1>
          <p className="text-xl text-text-muted mb-6">
            Claude will research them and generate personalized outreach using your <span className="text-primary">{parsedSpec.name}</span> API
          </p>
          <div className="bg-white rounded-lg border border-anthropic-border p-4 max-w-2xl mx-auto">
            <p className="text-sm text-text-muted">
              <strong>API Loaded:</strong> {parsedSpec.name} v{parsedSpec.version} ({parsedSpec.endpointCount} endpoints)
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-anthropic-border p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="companyUrl" className="block text-lg font-semibold text-text-dark mb-3">
                  Target Company URL
                </label>
                <input
                  type="url"
                  id="companyUrl"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && companyUrl.trim() && isValidUrl(companyUrl)) {
                      handleAnalyze();
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full bg-cream border border-anthropic-border rounded-lg px-4 py-3 text-text-dark placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                />
                <p className="text-sm text-text-muted mt-2">
                  Claude will visit this site, research the company, and generate a complete outreach suite.
                </p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!companyUrl.trim() || !isValidUrl(companyUrl)}
                className="w-full bg-text-dark text-white py-4 rounded-lg text-lg font-semibold hover:bg-text-dark/90 disabled:bg-light-alt disabled:text-text-muted transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                🚀 Analyze & Generate Outreach
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-8 space-x-6">
            <Link href="/upload" className="text-text-muted hover:text-text-dark transition-colors">
              ← Upload Different API Spec
            </Link>
            <Link href="/" className="text-text-muted hover:text-text-dark transition-colors">
              Back to Home
            </Link>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-dark mb-2">What Claude Will Generate</h2>
            <p className="text-text-muted">Powered by the Claude Agent SDK — every action is an API call</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-anthropic-border p-5 text-center">
              <div className="text-2xl mb-3">📧</div>
              <h3 className="text-sm font-semibold text-text-dark mb-1">Cold Email</h3>
              <p className="text-text-muted text-xs">Under 4 lines, personalized to their pain points</p>
            </div>
            <div className="bg-white rounded-lg border border-anthropic-border p-5 text-center">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-sm font-semibold text-text-dark mb-1">Demo Page</h3>
              <p className="text-text-muted text-xs">Branded for the target with their logo and name</p>
            </div>
            <div className="bg-white rounded-lg border border-anthropic-border p-5 text-center">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-sm font-semibold text-text-dark mb-1">Value Prop</h3>
              <p className="text-text-muted text-xs">Maps your endpoints to their specific problems</p>
            </div>
            <div className="bg-white rounded-lg border border-anthropic-border p-5 text-center">
              <div className="text-2xl mb-3">💼</div>
              <h3 className="text-sm font-semibold text-text-dark mb-1">LinkedIn</h3>
              <p className="text-text-muted text-xs">Short, specific connection message</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
