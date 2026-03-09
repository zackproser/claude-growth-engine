'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/upload', label: 'Upload Spec' },
  { href: '/target', label: 'Target' },
  { href: '/results', label: 'Results' },
  { href: '/tracking', label: '📊 Tracking' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/claude-logo.svg" alt="Claude" width={24} height={24} />
              <span className="text-lg font-semibold text-slate-900 tracking-tight">Growth Engine</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === link.href
                      ? 'text-primary bg-primary/10 font-medium'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
            <Image src="/claude-logo.svg" alt="" width={14} height={14} />
            <span className="text-slate-400">Powered by</span>
            <span className="font-semibold">Claude Agent SDK</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
