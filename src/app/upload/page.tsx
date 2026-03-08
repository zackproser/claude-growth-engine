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
  endpoints: string[];
}

export default function UploadPage() {
  const [specText, setSpecText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [parsedSpec, setParsedSpec] = useState<ParsedSpec | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const validateAndParseSpec = (content: string): ParsedSpec | null => {
    try {
      let spec: any;
      
      // Try parsing as JSON first
      try {
        spec = JSON.parse(content);
      } catch {
        // Try parsing as YAML (basic YAML parsing)
        // For a production app, you'd want to use a proper YAML parser
        throw new Error('Invalid JSON format. Please provide a valid JSON OpenAPI specification.');
      }

      // Validate OpenAPI structure
      if (!spec.openapi && !spec.swagger) {
        throw new Error('Not a valid OpenAPI specification. Missing "openapi" or "swagger" field.');
      }

      if (!spec.info) {
        throw new Error('Invalid OpenAPI spec. Missing "info" section.');
      }

      if (!spec.paths) {
        throw new Error('Invalid OpenAPI spec. Missing "paths" section.');
      }

      // Extract information
      const endpoints = Object.keys(spec.paths);
      const servers = spec.servers || [];
      const baseUrl = servers.length > 0 ? servers[0].url : '';

      return {
        name: spec.info.title || 'Unknown API',
        description: spec.info.description || 'No description provided',
        version: spec.info.version || 'Unknown',
        baseUrl,
        endpointCount: endpoints.length,
        endpoints: endpoints.slice(0, 10) // Show first 10 endpoints
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown parsing error');
    }
  };

  const handleTextSubmit = async () => {
    if (!specText.trim()) {
      setError('Please paste your OpenAPI specification');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const parsed = validateAndParseSpec(specText);
      setParsedSpec(parsed);
      
      // Store in localStorage
      localStorage.setItem('openapi-spec', JSON.stringify({
        raw: specText,
        parsed
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      setError('Please upload a .json or .yaml file');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const content = await file.text();
      const parsed = validateAndParseSpec(content);
      setParsedSpec(parsed);
      setSpecText(content);
      
      // Store in localStorage
      localStorage.setItem('openapi-spec', JSON.stringify({
        raw: content,
        parsed
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File processing failed');
    } finally {
      setIsValidating(false);
    }
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
              Great! We've successfully parsed your API specification.
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
              <h3 className="text-lg font-semibold text-text-light mb-3">Sample Endpoints</h3>
              <div className="space-y-2">
                {parsedSpec.endpoints.map((endpoint, index) => (
                  <div key={index} className="bg-dark rounded px-3 py-2 text-sm font-mono text-neutral-300">
                    {endpoint}
                  </div>
                ))}
                {parsedSpec.endpointCount > 10 && (
                  <p className="text-sm text-neutral-400">
                    ... and {parsedSpec.endpointCount - 10} more endpoints
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
            Choose your preferred method to provide your API specification
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="bg-dark-alt rounded-lg border border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-text-light mb-4">Upload File</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-neutral-600 hover:border-neutral-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="text-4xl">📄</div>
                <div>
                  <p className="text-text-light mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-neutral-400 mb-4">
                    Supports .json, .yaml, .yml files
                  </p>
                  <label className="inline-block bg-neutral-700 hover:bg-neutral-600 text-text-light px-4 py-2 rounded cursor-pointer transition-colors">
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept=".json,.yaml,.yml"
                      onChange={handleFileInputChange}
                    />
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
                placeholder="Paste your OpenAPI specification (JSON format) here..."
                className="w-full h-48 bg-dark border border-neutral-600 rounded-lg px-4 py-3 text-text-light placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary resize-none font-mono text-sm"
              />
              
              <button
                onClick={handleTextSubmit}
                disabled={isValidating || !specText.trim()}
                className="w-full bg-primary text-dark py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-neutral-600 disabled:text-neutral-400 transition-colors"
              >
                {isValidating ? 'Validating...' : 'Validate Specification'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link 
            href="/"
            className="text-neutral-400 hover:text-text-light transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}