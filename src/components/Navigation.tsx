import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  return (
    <nav className="bg-dark-alt/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center space-x-2.5">
            <Image src="/claude-logo.svg" alt="Claude" width={24} height={24} />
            <span className="text-lg font-semibold text-text-light tracking-tight">Growth Engine</span>
          </Link>
          <Image src="/powered-by-claude.svg" alt="Powered by Claude Agent SDK" width={200} height={28} />
        </div>
      </div>
    </nav>
  );
}
