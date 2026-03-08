import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-text-light mb-6 leading-tight">
              Turn your API into a{' '}
              <span className="text-primary">growth engine</span>
            </h1>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Powered by Claude Agent SDK. Simply paste your OpenAPI specification, and Claude will analyze it to generate personalized, compelling outreach for any target company.
            </p>
            
            <Link 
              href="/upload"
              className="inline-block bg-primary text-dark px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>

          {/* How it works */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-text-light mb-12">How it works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-dark-alt rounded-lg p-8 border border-neutral-700">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-dark font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-text-light mb-4">Paste your OpenAPI spec</h3>
                <p className="text-neutral-300">
                  Upload your API specification in JSON or YAML format, or paste it directly into our editor.
                </p>
              </div>

              <div className="bg-dark-alt rounded-lg p-8 border border-neutral-700">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-dark font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-text-light mb-4">Claude analyzes</h3>
                <p className="text-neutral-300">
                  Our AI deeply understands your API capabilities, endpoints, and potential use cases for targeted outreach.
                </p>
              </div>

              <div className="bg-dark-alt rounded-lg p-8 border border-neutral-700">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-dark font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-text-light mb-4">Get personalized outreach</h3>
                <p className="text-neutral-300">
                  Receive tailored messaging that explains how your API solves specific problems for your target companies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}