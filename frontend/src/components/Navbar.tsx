'use client';

import { useUser, useClerk } from '@clerk/clerk-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Clapperboard, Film, Star, Tv, Search, Bell, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const platforms = [
  { name: 'Netflix', href: '/netflix', color: '#E50914', icon: Film },
  { name: 'Shahid', href: '/shahid', color: '#00ca97', icon: Tv },
  { name: 'Disney+', href: '/disney', color: '#113CCF', icon: Star },
  { name: 'Crunchyroll', href: '/crunchyroll', color: '#F47521', icon: Clapperboard },
];

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isLanding = pathname === '/';
  const hideNav = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (showUserMenu) setShowUserMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showUserMenu]);

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
            <Link href={isSignedIn ? '/netflix' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-red-600 flex items-center justify-center font-black text-white text-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-red-600/30">
                O
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-lg leading-none">OSAMA/</span>
                <span className="text-red-500 font-bold text-lg leading-none">Dev</span>
              </div>
            </Link>

            {isSignedIn && (
              <div className="hidden md:flex items-center gap-1">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  const active = pathname.startsWith(p.href);
                  return (
                    <Link
                      key={p.name}
                      href={p.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                        active
                          ? 'text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      )}
                      style={active ? { backgroundColor: `${p.color}15`, color: p.color, boxShadow: `0 0 20px ${p.color}10` } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{p.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2">
              {isLoaded && isSignedIn ? (
                <>
                  <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <Search className="w-4.5 h-4.5" />
                  </button>
                  <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all relative">
                    <Bell className="w-4.5 h-4.5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                  </button>

                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center overflow-hidden ring-2 ring-white/10 hover:ring-red-500/50 transition-all">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {showUserMenu && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 glass-strong rounded-2xl py-2 shadow-2xl border border-white/10">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white text-sm font-medium truncate">
                            {user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || ''}
                          </p>
                          <p className="text-zinc-500 text-xs truncate mt-0.5">
                            {user?.primaryEmailAddress?.emailAddress || ''}
                          </p>
                        </div>
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-all text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    )}
                  </div>
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
                const Icon = p.icon;
                const active = pathname.startsWith(p.href);
                return (
                  <Link
                    key={p.name}
                    href={p.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all',
                      active ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    )}
                    style={active ? { backgroundColor: `${p.color}15`, borderRight: `3px solid ${p.color}` } : undefined}
                  >
                    <Icon className="w-5 h-5" style={{ color: p.color }} />
                    {p.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
