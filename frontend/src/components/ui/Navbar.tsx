'use client';
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/stores/theme';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const platforms = [
  { key: 'netflix', label: 'Netflix', href: '/netflix' },
  { key: 'shahid', label: 'Shahid', href: '/shahid' },
  { key: 'disney', label: 'Disney+', href: '/disney' },
  { key: 'crunchyroll', label: 'Crunchyroll', href: '/crunchyroll' },
] as const;

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const setTheme = useThemeStore((s) => s.setTheme);

  if (pathname === '/login' || pathname === '/verify' || pathname === '/username') return null;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastScroll || y < 80);
      setScrolled(y > 50);
      setLastScroll(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScroll]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      } ${scrolled ? 'glass-dark' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          OSAMA/<span className="text-[var(--primary)]">Dev</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {platforms.map((p) => (
            <Link
              key={p.key}
              href={p.href}
              onClick={() => setTheme(p.key)}
              className="px-3 py-1.5 text-sm rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {p.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/search" className="text-zinc-300 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <Link href="/favorites" className="text-zinc-300 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <Link href="/settings" className="text-zinc-300 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
