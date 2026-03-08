'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

      if (!res.ok) {
        setError(data.error || 'Validation failed');
        return;
      }

      if (!data.valid) {
        setValidationErrors(data.errors || ['Invalid OpenAPI specification']);
        return;
      }

      setParsedSpec(data.parsed);

      // Store raw spec + parsed data for the target page
      localStorage.setItem('openapi-spec', JSON.stringify({
        raw: content,
        parsed: data.parsed,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate specification');
    } finally {
      setIsValidating(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!specText.trim()) {
      setError('Please paste your OpenAPI specification');
      return;
    }
    await validateSpec(specText);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      setError('Please upload a .json or .yaml file');
      return;
    }

    const content = await file.text();
    setSpecText(content);
    await validateSpec(content);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  if (parsedSpec) {
    return (
      <div className="bg-dark min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-light mb-4">
              OpenAPI Spec Validated ✓
            </h1>
            <p className="text-xl text-neutral-300">
              Validated with <span className="text-accent">swagger-parser</span> — your spec is good to go.
            </p>
          </div>

          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-text-light mb-2">API Name</h3>
                <p className="text-primary text-xl font-medium">{parsedSpec.name}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-light mb-2">Version</h3>
                <p className="text-neutral-300">{parsedSpec.version}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-light mb-2">Endpoints</h3>
                <p className="text-accent text-xl font-medium">{parsedSpec.endpointCount} endpoints</p>
              </div>
              {parsedSpec.baseUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-text-light mb-2">Base URL</h3>
                  <p className="text-neutral-300 break-all">{parsedSpec.baseUrl}</p>
                </div>
              )}
            </div>

            {parsedSpec.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-text-light mb-2">Description</h3>
                <p className="text-neutral-300">{parsedSpec.description}</p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-text-light mb-3">Endpoints</h3>
              <div className="space-y-2">
                {parsedSpec.endpoints.slice(0, 15).map((ep, index) => (
                  <div key={index} className="bg-dark rounded px-3 py-2 text-sm font-mono text-neutral-300 flex items-start gap-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      ep.method === 'GET' ? 'bg-green-900/40 text-green-400' :
                      ep.method === 'POST' ? 'bg-blue-900/40 text-blue-400' :
                      ep.method === 'PUT' ? 'bg-yellow-900/40 text-yellow-400' :
                      ep.method === 'DELETE' ? 'bg-red-900/40 text-red-400' :
                      'bg-neutral-700 text-neutral-300'
                    }`}>
                      {ep.method}
                    </span>
                    <span>{ep.path}</span>
                    {ep.summary && (
                      <span className="text-neutral-500 text-xs ml-auto">{ep.summary}</span>
                    )}
                  </div>
                ))}
                {parsedSpec.endpointCount > 15 && (
                  <p className="text-sm text-neutral-400">
                    ... and {parsedSpec.endpointCount - 15} more endpoints
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/target"
              className="inline-block bg-primary text-dark px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Next: Choose Target →
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
            Upload Your OpenAPI Specification
          </h1>
          <p className="text-xl text-neutral-300">
            We validate with <span className="text-accent">swagger-parser</span> to ensure your spec is correct.
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
                <div>
                  <p className="text-text-light mb-2">Drag and drop your file here</p>
                  <p className="text-sm text-neutral-400 mb-4">Supports .json, .yaml, .yml files</p>
                  <label className="inline-block bg-neutral-700 hover:bg-neutral-600 text-text-light px-4 py-2 rounded cursor-pointer transition-colors">
                    Choose File
                    <input type="file" className="hidden" accept=".json,.yaml,.yml" onChange={handleFileInputChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-text-light mb-4">Paste Specification</h3>
            <div className="space-y-4">
              <textarea
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder='Paste your OpenAPI specification (JSON) here...'
                className="w-full h-48 bg-dark border border-neutral-600 rounded-lg px-4 py-3 text-text-light placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary resize-none font-mono text-sm"
              />
              <button
                onClick={handleTextSubmit}
                disabled={isValidating || !specText.trim()}
                className="w-full bg-primary text-dark py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-neutral-600 disabled:text-neutral-400 transition-colors"
              >
                {isValidating ? 'Validating with swagger-parser...' : 'Validate Specification'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-300 font-semibold mb-2">Validation Errors:</p>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-red-300 text-sm">{err}</li>
              ))}
            </ul>
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
