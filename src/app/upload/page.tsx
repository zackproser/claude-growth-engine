'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function UploadPage() {
  const [specText, setSpecText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedSpec, setParsedSpec] = useState<ParsedSpec | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const validateSpec = async (content: string) => {
    setIsValidating(true);
    setError('');
    setValidationErrors([]);

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawSpec: content }),
      });

      const data = await res.json();

      if (!data.valid) {
        setValidationErrors(data.errors || ['Validation failed']);
        return;
      }

      setParsedSpec(data.parsed);

      // Store in localStorage for the target page
      localStorage.setItem('openapi-spec', JSON.stringify({
        raw: content,
        parsed: data.parsed,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation request failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleTextSubmit = () => {
    if (!specText.trim()) {
      setError('Please paste your OpenAPI specification');
      return;
    }
    validateSpec(specText);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(json|yaml|yml)$/)) {
      setError('Please upload a .json or .yaml file');
      return;
    }

    const content = await file.text();
    setSpecText(content);
    validateSpec(content);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  if (parsedSpec) {
    return (
      <div className="bg-dark min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-light mb-4">
              Spec Validated ✓
            </h1>
            <p className="text-neutral-300">
              Validated with{' '}
              <a href="https://github.com/APIDevTools/swagger-parser" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                swagger-parser
              </a>
            </p>
          </div>

          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">API Name</h3>
                <p className="text-primary text-xl font-semibold">{parsedSpec.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Version</h3>
                <p className="text-text-light">{parsedSpec.version}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Endpoints</h3>
                <p className="text-accent text-xl font-semibold">{parsedSpec.endpointCount}</p>
              </div>
              {parsedSpec.baseUrl && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-1">Base URL</h3>
                  <p className="text-text-light break-all font-mono text-sm">{parsedSpec.baseUrl}</p>
                </div>
              )}
            </div>

            {parsedSpec.description && (
              <div className="mt-6 pt-6 border-t border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-500 mb-2">Description</h3>
                <p className="text-neutral-300">{parsedSpec.description}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-neutral-700">
              <h3 className="text-sm font-medium text-neutral-500 mb-3">Endpoints</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {parsedSpec.endpoints.slice(0, 15).map((ep, i) => (
                  <div key={i} className="flex items-start gap-3 bg-dark rounded px-3 py-2">
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      ep.method === 'GET' ? 'bg-green-900/30 text-green-400' :
                      ep.method === 'POST' ? 'bg-blue-900/30 text-blue-400' :
                      ep.method === 'PUT' ? 'bg-yellow-900/30 text-yellow-400' :
                      ep.method === 'DELETE' ? 'bg-red-900/30 text-red-400' :
                      'bg-neutral-700 text-neutral-300'
                    }`}>
                      {ep.method}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-text-light">{ep.path}</p>
                      {ep.summary && (
                        <p className="text-xs text-neutral-400 mt-0.5">{ep.summary}</p>
                      )}
                    </div>
                  </div>
                ))}
                {parsedSpec.endpointCount > 15 && (
                  <p className="text-xs text-neutral-500 text-center pt-2">
                    + {parsedSpec.endpointCount - 15} more endpoints
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/target"
              className="inline-block bg-primary text-dark px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Next: Choose Target Company →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-light mb-4">
            Upload Your OpenAPI Spec
          </h1>
          <p className="text-xl text-neutral-300">
            JSON format • Validated with{' '}
            <a href="https://github.com/APIDevTools/swagger-parser" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              swagger-parser
            </a>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-text-light mb-4">Upload File</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/10' : 'border-neutral-600 hover:border-neutral-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="text-4xl">📄</div>
                <p className="text-text-light mb-2">Drag and drop your file here</p>
                <p className="text-sm text-neutral-400 mb-4">.json, .yaml, .yml</p>
                <label className="inline-block bg-neutral-700 hover:bg-neutral-600 text-text-light px-4 py-2 rounded cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept=".json,.yaml,.yml"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-text-light mb-4">Paste Spec</h3>
            <textarea
              value={specText}
              onChange={(e) => setSpecText(e.target.value)}
              placeholder='{"openapi": "3.0.0", "info": {...}, "paths": {...}}'
              className="w-full h-48 bg-dark border border-neutral-600 rounded-lg px-4 py-3 text-text-light placeholder-neutral-500 focus:border-primary focus:ring-1 focus:ring-primary resize-none font-mono text-sm"
            />
            <button
              onClick={handleTextSubmit}
              disabled={isValidating || !specText.trim()}
              className="w-full mt-4 bg-primary text-dark py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-neutral-600 disabled:text-neutral-400 transition-colors"
            >
              {isValidating ? 'Validating with swagger-parser...' : 'Validate Specification'}
            </button>
          </div>
        </div>

        {(error || validationErrors.length > 0) && (
          <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
            {error && <p className="text-red-300">{error}</p>}
            {validationErrors.map((e, i) => (
              <p key={i} className="text-red-300 text-sm">{e}</p>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-neutral-400 hover:text-text-light transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
