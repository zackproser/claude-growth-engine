'use client';

import { useState, useEffect } from 'react';
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

export default function TargetPage() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [parsedSpec, setParsedSpec] = useState<ParsedSpec | null>(null);
  const [rawSpec, setRawSpec] = useState('');
  const router = useRouter();

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

  const handleAnalyze = async () => {
    if (!companyUrl.trim()) return;

    setIsAnalyzing(true);
    setError('');
    setStatusMessages(['Connecting to Claude Agent SDK...']);

    // Normalize URL
    const normalizedUrl = companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`;

    // Simulate progressive status updates while the agent works
    const statusInterval = setInterval(() => {
      setStatusMessages(prev => {
        const messages = [
          'Connecting to Claude Agent SDK...',
          'Agent is searching the web for company information...',
          'Analyzing company website and business model...',
          'Identifying pain points and tech stack...',
          'Mapping API endpoints to company needs...',
          'Generating personalized cold email...',
          'Building value proposition...',
          'Creating demo page content...',
          'Crafting LinkedIn outreach message...',
          'Finalizing outreach suite...',
        ];
        const nextIndex = Math.min(prev.length, messages.length - 1);
        if (prev.length < messages.length) {
          return [...prev, messages[nextIndex]];
        }
        return prev;
      });
    }, 3000);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSpec,
          targetUrl: normalizedUrl,
        }),
      });

      clearInterval(statusInterval);

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed');
        setIsAnalyzing(false);
        return;
      }

      // Store result for the results page
      localStorage.setItem('latest-result', JSON.stringify(data));

      // Navigate to results
      router.push(`/results?id=${data.id}`);
    } catch (err) {
      clearInterval(statusInterval);
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
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-text-light mb-2">Claude Agent is Working</h2>
            <p className="text-neutral-400 text-sm mb-2">
              Targeting: <span className="text-primary">{companyUrl}</span>
            </p>
            <p className="text-neutral-400 text-sm">
              Using: <span className="text-accent">{parsedSpec?.name}</span> ({parsedSpec?.endpointCount} endpoints)
            </p>
          </div>

          <div className="space-y-2 text-left bg-dark-alt rounded-lg p-6 border border-neutral-700">
            {statusMessages.map((msg, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                  i === statusMessages.length - 1 ? 'bg-primary animate-pulse' : 'bg-green-500'
                }`}></div>
                <span className={`text-sm ${
                  i === statusMessages.length - 1 ? 'text-text-light' : 'text-neutral-500'
                }`}>
                  {i < statusMessages.length - 1 ? '✓ ' : ''}{msg}
                </span>
              </div>
            ))}
          </div>

          <p className="text-neutral-500 text-xs mt-4">
            This typically takes 30-60 seconds. The agent is making real API calls.
          </p>
        </div>
      </div>
    );
  }

  if (!parsedSpec) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-dark min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-light mb-4">
            Choose Your Target Company
          </h1>
          <p className="text-xl text-neutral-300 mb-6">
            Claude will research them and generate personalized outreach using your <span className="text-primary">{parsedSpec.name}</span> API
          </p>
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-4 max-w-2xl mx-auto">
            <p className="text-sm text-neutral-400">
              <strong>API Loaded:</strong> {parsedSpec.name} v{parsedSpec.version} ({parsedSpec.endpointCount} endpoints)
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="companyUrl" className="block text-lg font-semibold text-text-light mb-3">
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
                  className="w-full bg-dark border border-neutral-600 rounded-lg px-4 py-3 text-text-light placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                />
                <p className="text-sm text-neutral-400 mt-2">
                  Claude will visit this site, research the company, and generate a complete outreach suite.
                </p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!companyUrl.trim() || !isValidUrl(companyUrl)}
                className="w-full bg-primary text-dark py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 disabled:bg-neutral-600 disabled:text-neutral-400 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                🚀 Analyze & Generate Outreach
              </button>

              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <p className="text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-8 space-x-6">
            <Link href="/upload" className="text-neutral-400 hover:text-text-light transition-colors">
              ← Upload Different API Spec
            </Link>
            <Link href="/" className="text-neutral-400 hover:text-text-light transition-colors">
              Back to Home
            </Link>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-light mb-2">What Claude Will Generate</h2>
            <p className="text-neutral-400">Powered by the Claude Agent SDK — every action is an API call</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-5 text-center">
              <div className="text-2xl mb-3">📧</div>
              <h3 className="text-sm font-semibold text-text-light mb-1">Cold Email</h3>
              <p className="text-neutral-400 text-xs">Under 4 lines, personalized to their pain points</p>
            </div>
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-5 text-center">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-sm font-semibold text-text-light mb-1">Demo Page</h3>
              <p className="text-neutral-400 text-xs">Branded for the target with their logo and name</p>
            </div>
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-5 text-center">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-sm font-semibold text-text-light mb-1">Value Prop</h3>
              <p className="text-neutral-400 text-xs">Maps your endpoints to their specific problems</p>
            </div>
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-5 text-center">
              <div className="text-2xl mb-3">💼</div>
              <h3 className="text-sm font-semibold text-text-light mb-1">LinkedIn</h3>
              <p className="text-neutral-400 text-xs">Short, specific connection message</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
