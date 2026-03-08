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
  endpoints: string[];
}

export default function TargetPage() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [parsedSpec, setParsedSpec] = useState<ParsedSpec | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a parsed spec in localStorage
    const stored = localStorage.getItem('openapi-spec');
    if (stored) {
      try {
        const { parsed } = JSON.parse(stored);
        setParsedSpec(parsed);
      } catch (err) {
        console.error('Failed to load spec from localStorage:', err);
        router.push('/upload');
      }
    } else {
      router.push('/upload');
    }
  }, [router]);

  const handleAnalyze = async () => {
    if (!companyUrl.trim()) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call with loading state
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 3000);
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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-text-light mb-2">Analyzing Target Company</h2>
            <p className="text-neutral-300">
              Claude is researching the company and generating personalized outreach based on your API...
            </p>
          </div>
          
          <div className="space-y-3 text-left bg-dark-alt rounded-lg p-6 border border-neutral-700">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-neutral-300">Analyzing company website and business model</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm text-neutral-300">Mapping API capabilities to business needs</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-neutral-300">Generating personalized outreach messaging</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="bg-dark min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-light mb-4">
              Outreach Generated ✨
            </h1>
            <p className="text-xl text-neutral-300">
              Here's your personalized outreach for <span className="text-primary">{companyUrl}</span>
            </p>
          </div>

          <div className="space-y-8">
            {/* Email Subject Lines */}
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-text-light mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
                  ✉️
                </span>
                Email Subject Lines
              </h3>
              <div className="space-y-3">
                <div className="bg-dark rounded-lg p-4 border-l-4 border-primary">
                  <p className="text-text-light">"Increase {companyUrl.replace(/^https?:\/\//, '').split('.')[0]} efficiency with our {parsedSpec?.name || 'API'} integration"</p>
                </div>
                <div className="bg-dark rounded-lg p-4 border-l-4 border-accent">
                  <p className="text-text-light">"How {parsedSpec?.name || 'our API'} can solve your data integration challenges"</p>
                </div>
                <div className="bg-dark rounded-lg p-4 border-l-4 border-primary">
                  <p className="text-text-light">"Quick question about {companyUrl.replace(/^https?:\/\//, '').split('.')[0]}'s current tech stack"</p>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-text-light mb-4 flex items-center">
                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                  📝
                </span>
                Email Template
              </h3>
              <div className="bg-dark rounded-lg p-6 text-neutral-300 leading-relaxed">
                <p className="mb-4">Hi [Name],</p>
                
                <p className="mb-4">
                  I noticed that {companyUrl.replace(/^https?:\/\//, '').split('.')[0]} is focused on [specific business area based on website analysis]. 
                  I thought you might be interested in how our {parsedSpec?.name || 'API'} could help streamline your current processes.
                </p>

                <p className="mb-4">
                  Our {parsedSpec?.name || 'API'} provides {parsedSpec?.endpointCount || 'multiple'} endpoints that could help you:
                </p>

                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Automate data workflows that currently require manual intervention</li>
                  <li>Integrate with your existing systems seamlessly</li>
                  <li>Reduce operational overhead and improve accuracy</li>
                </ul>

                <p className="mb-4">
                  Based on what I see on your website, this could particularly help with [specific pain point identified from company analysis].
                </p>

                <p className="mb-4">
                  Would you be open to a brief 15-minute call to explore how this might fit into your current tech stack?
                </p>

                <p>
                  Best regards,<br />
                  [Your Name]
                </p>
              </div>
            </div>

            {/* LinkedIn Message */}
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-text-light mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  💼
                </span>
                LinkedIn Message
              </h3>
              <div className="bg-dark rounded-lg p-6 text-neutral-300 leading-relaxed">
                <p className="mb-3">
                  Hi [Name], I see you're leading engineering at {companyUrl.replace(/^https?:\/\//, '').split('.')[0]}. 
                  Our {parsedSpec?.name || 'API'} has helped similar companies in your space reduce integration time by 60%. 
                </p>
                
                <p>
                  Quick question - are you currently looking for better ways to handle [specific technical challenge]? 
                  I'd love to share how we've solved this for other teams.
                </p>
              </div>
            </div>

            {/* Value Propositions */}
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-text-light mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
                  💡
                </span>
                Key Value Propositions
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="text-primary font-medium mb-2">Time Savings</h4>
                  <p className="text-sm text-neutral-300">Reduce integration time from weeks to days with our well-documented API</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="text-accent font-medium mb-2">Cost Efficiency</h4>
                  <p className="text-sm text-neutral-300">Lower development costs with pre-built solutions for common use cases</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="text-primary font-medium mb-2">Scalability</h4>
                  <p className="text-sm text-neutral-300">Built to handle enterprise-scale traffic with 99.9% uptime</p>
                </div>
                <div className="bg-dark rounded-lg p-4">
                  <h4 className="text-accent font-medium mb-2">Easy Integration</h4>
                  <p className="text-sm text-neutral-300">RESTful design with comprehensive SDKs for major languages</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 space-x-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCompanyUrl('');
              }}
              className="bg-neutral-700 hover:bg-neutral-600 text-text-light px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Analyze Another Company
            </button>
            
            <Link
              href="/upload"
              className="inline-block bg-primary text-dark px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Upload New API Spec
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!parsedSpec) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-300">Loading...</p>
        </div>
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
            Enter the company URL and we'll generate personalized outreach based on your <span className="text-primary">{parsedSpec.name}</span> API
          </p>
          
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-4 max-w-2xl mx-auto">
            <p className="text-sm text-neutral-400">
              <strong>API Loaded:</strong> {parsedSpec.name} ({parsedSpec.endpointCount} endpoints)
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
                  placeholder="https://example.com"
                  className="w-full bg-dark border border-neutral-600 rounded-lg px-4 py-3 text-text-light placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary text-lg"
                />
                <p className="text-sm text-neutral-400 mt-2">
                  We'll analyze their website to understand their business and generate targeted messaging
                </p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!companyUrl.trim() || !isValidUrl(companyUrl)}
                className="w-full bg-primary text-dark py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 disabled:bg-neutral-600 disabled:text-neutral-400 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                🚀 Analyze & Generate Outreach
              </button>
            </div>
          </div>

          <div className="text-center mt-8 space-x-6">
            <Link 
              href="/upload"
              className="text-neutral-400 hover:text-text-light transition-colors"
            >
              ← Upload Different API Spec
            </Link>
            <Link 
              href="/"
              className="text-neutral-400 hover:text-text-light transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Preview Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-light mb-4">What You'll Get</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                ✉️
              </div>
              <h3 className="text-lg font-semibold text-text-light mb-2">Email Templates</h3>
              <p className="text-neutral-300 text-sm">
                Multiple subject lines and personalized email templates ready to send
              </p>
            </div>
            
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6 text-center">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                💼
              </div>
              <h3 className="text-lg font-semibold text-text-light mb-2">LinkedIn Messages</h3>
              <p className="text-neutral-300 text-sm">
                Concise, professional LinkedIn outreach messages for decision makers
              </p>
            </div>
            
            <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                🎯
              </div>
              <h3 className="text-lg font-semibold text-text-light mb-2">Value Props</h3>
              <p className="text-neutral-300 text-sm">
                Specific value propositions tailored to the target company's needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}