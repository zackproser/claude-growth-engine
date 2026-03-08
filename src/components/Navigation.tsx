'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/upload', label: 'Upload Spec' },
  { href: '/target', label: 'Target' },
  { href: '/results', label: 'Results' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-dark-alt/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/claude-logo.svg" alt="Claude" width={24} height={24} />
              <span className="text-lg font-semibold text-text-light tracking-tight">Growth Engine</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-neutral-400 hover:text-text-light hover:bg-neutral-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Image src="/powered-by-claude.svg" alt="Powered by Claude Agent SDK" width={200} height={28} />
        </div>
      </div>
    </nav>
  );
}
