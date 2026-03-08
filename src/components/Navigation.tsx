import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-dark border-b border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-dark font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-semibold text-text-light">Growth Engine</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm text-neutral-400">Powered by Claude</span>
          </div>
        </div>
      </div>
    </nav>
  );
}