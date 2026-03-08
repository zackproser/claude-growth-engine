'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ParsedSpec {
  name: string;
  description: string;
  version: string;
  baseUrl?: string;
  endpointCount: number;
  endpoints: Array<{
    path: string;
    method: string;
    summary?: string;
    description?: string;
  }>;
}

const analysisSteps = [
  { label: 'Researching company website...', icon: '🔍' },
  { label: 'Identifying pain points and tech stack...', icon: '🎯' },
  { label: 'Mapping API endpoints to their needs...', icon: '🗺️' },
  { label: 'Generating personalized cold email...', icon: '📧' },
  { label: 'Building branded demo page content...', icon: '🎨' },
  { label: 'Crafting value proposition...', icon: '💡' },
  { label: 'Logging to tracking sheet...', icon: '📊' },
];

export default function TargetPage() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < analysisSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!companyUrl.trim()) return;

    const url = companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`;

    setIsAnalyzing(true);
    setCurrentStep(0);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawSpec, targetUrl: url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Store result for the results page
      localStorage.setItem('latest-result', JSON.stringify(data));

      // Navigate to results
      router.push(`/results?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
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
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-text-light mb-2">
              Claude is analyzing {companyUrl}
            </h2>
            <p className="text-neutral-400 text-sm">
              This takes 30-60 seconds while Claude researches the company
            </p>
          </div>

          <div className="space-y-3 text-left bg-dark-alt rounded-lg p-6 border border-neutral-700">
            {analysisSteps.map((step, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`w-6 h-6 flex items-center justify-center text-sm ${
                  i < currentStep ? 'text-green-400' :
                  i === currentStep ? 'animate-pulse' : 'opacity-30'
                }`}>
                  {i < currentStep ? '✓' : step.icon}
                </div>
                <span className={`text-sm ${
                  i < currentStep ? 'text-green-400' :
                  i === currentStep ? 'text-text-light' : 'text-neutral-600'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!parsedSpec) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            Claude will research them and generate personalized outreach from your{' '}
            <span className="text-primary">{parsedSpec.name}</span> API
          </p>

          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-4 max-w-2xl mx-auto">
            <p className="text-sm text-neutral-400">
              <strong className="text-text-light">API Loaded:</strong>{' '}
              {parsedSpec.name} v{parsedSpec.version} — {parsedSpec.endpointCount} endpoints
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="companyUrl" className="block text-lg font-semibold text-text-light mb-3">
                  Company Website URL
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
                  placeholder="https://stripe.com"
                  className="w-full bg-dark border border-neutral-600 rounded-lg px-4 py-3 text-text-light placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                />
                <p className="text-sm text-neutral-400 mt-2">
                  Claude will scrape their site, find their logo, analyze pain points, and craft personalized outreach
                </p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!companyUrl.trim() || !isValidUrl(companyUrl)}
                className="w-full bg-primary text-dark py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 disabled:bg-neutral-600 disabled:text-neutral-400 transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                🚀 Analyze & Generate Outreach
              </button>
            </div>
          </div>

          <div className="text-center mt-8 space-x-6">
            <Link href="/upload" className="text-neutral-400 hover:text-text-light transition-colors">
              ← Upload Different API Spec
            </Link>
          </div>
        </div>

        {/* What you'll get */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-semibold text-text-light mb-6 text-center">What Claude Generates</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '📧', title: 'Cold Email', desc: 'Under 4 lines, curiosity-driven' },
              { icon: '🎯', title: 'Demo Page', desc: 'Branded for the target company' },
              { icon: '📊', title: 'Value Prop', desc: 'Endpoints mapped to pain points' },
              { icon: '💼', title: 'LinkedIn', desc: 'Short connection message' },
            ].map((item, i) => (
              <div key={i} className="bg-dark-alt rounded-lg border border-neutral-700 p-5 text-center">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-text-light mb-1">{item.title}</h3>
                <p className="text-neutral-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
