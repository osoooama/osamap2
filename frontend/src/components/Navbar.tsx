'use client';

import { useUser, useClerk } from '@clerk/clerk-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Heart, LogOut, User, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

const platforms = [
  { name: 'Netflix', href: '/netflix', color: '#E50914', logo: '/netflix.webp' },
  { name: 'Shahid', href: '/shahid', color: '#00ca97', logo: '/shahid.webp' },
  { name: 'Disney+', href: '/disney', color: '#113CCF', logo: '/disney.webp' },
  { name: 'Crunchyroll', href: '/crunchyroll', color: '#F47521', logo: '/crunchyroll.webp' },
];

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = pathname === '/';
  const hideNav = pathname.startsWith('/sign-in');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (hideNav) return null;

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled || !isLanding
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20'
            : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href={isSignedIn ? '/netflix' : '/'} className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white/10 group-hover:ring-red-500/50 transition-all duration-300 shadow-lg shadow-red-600/20">
                <Image src="/logo.webp" alt="OSK+" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-lg leading-none">OSK</span>
                <span className="text-red-500 font-bold text-lg leading-none">+</span>
              </div>
            </Link>

            {isSignedIn && (
              <div className="hidden md:flex items-center gap-1">
                {platforms.map((p) => {
                  const active = pathname.startsWith(p.href);
                  return (
                    <Link
                      key={p.name}
                      href={p.href}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300',
                        active
                          ? 'text-white shadow-sm bg-white/5'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      )}
                      style={active ? { boxShadow: `0 0 20px ${p.color}15` } : undefined}
                    >
                      <div className="w-5 h-5 rounded overflow-hidden shrink-0">
                        <Image src={p.logo} alt={p.name} width={20} height={20} className="w-full h-full object-cover" />
                      </div>
                      <span className={active ? '' : ''} style={active ? { color: p.color } : undefined}>{p.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2">
              {isLoaded && isSignedIn ? (
                <>
                  <Link
                    href="/search"
                    className="flex w-11 h-11 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                    title="بحث"
                  >
                    <Search className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex w-11 h-11 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                    title="المفضلة"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/netflix"
                    className="hidden sm:flex w-11 h-11 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                    title="المنصات"
                  >
                    <Code className="w-5 h-5" />
                  </Link>

                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400 truncate max-w-20">
                      {user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'مستخدم'}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all text-xs font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-600/40"
                >
                  تسجيل الدخول
                </Link>
              )}

              {isSignedIn && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && isSignedIn && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-4 right-4 glass-strong rounded-2xl p-4 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {platforms.map((p) => {
                const active = pathname.startsWith(p.href);
                return (
                  <Link
                    key={p.name}
                    href={p.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      active ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    )}
                    style={active ? { borderRight: `3px solid ${p.color}` } : undefined}
                  >
                    <div className="w-6 h-6 rounded overflow-hidden shrink-0">
                      <Image src={p.logo} alt={p.name} width={24} height={24} className="w-full h-full object-cover" />
                    </div>
                    <span style={active ? { color: p.color } : undefined}>{p.name}</span>
                  </Link>
                );
              })}
              <hr className="border-white/5 my-2" />
              <Link
                href="/search"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Search className="w-5 h-5" />
                بحث
              </Link>
              <Link
                href="/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Heart className="w-5 h-5" />
                المفضلة
              </Link>
              <Link
                href="/netflix"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Code className="w-5 h-5" />
                المنصات
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
