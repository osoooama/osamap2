'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Heart, LogOut, User, GitBranch, Mail, Globe, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const platforms = [
  { name: 'Netflix', href: '/netflix', color: '#E50914', logo: '/netflix.webp' },
  { name: 'Shahid', href: '/shahid', color: '#00ca97', logo: '/shahid.webp' },
  { name: 'Disney+', href: '/disney', color: '#113CCF', logo: '/disney.webp' },
  { name: 'Crunchyroll', href: '/crunchyroll', color: '#F47521', logo: '/crunchyroll.webp' },
];

function DeveloperModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="relative h-48 bg-gradient-to-br from-emerald-600/20 via-zinc-900 to-teal-600/10">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-zinc-900 shadow-2xl">
                  <Image src="/developer.webp" alt="أسامة كريشان" width={128} height={128} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="pt-20 pb-6 px-6 text-center">
              <h2 className="text-2xl font-black text-white mb-1 font-arabic-display">أسامة كريشان</h2>
              <p className="text-zinc-500 text-sm mb-4">Osama Kreishan</p>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                مطور Full-Stack متخصص في بناء منصات البث المباشر وأنظمة الزحف المؤتمتة. مؤسس منصة OSK+.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">مطور Full-Stack</span>
                <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 text-xs border border-teal-500/20">Python</span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">Next.js</span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">Playwright</span>
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">MongoDB</span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <a href="mailto:osamakreshan49@gmail.com" className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 hover:border-emerald-500/20 transition">
                  <Mail className="w-4 h-4 text-zinc-400" />
                </a>
                <a href="https://github.com/osoooama" target="_blank" className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 hover:border-teal-500/20 transition">
                  <GitBranch className="w-4 h-4 text-zinc-400" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const isLanding = pathname === '/';
  const hideNav = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (hideNav) return null;

  const isSignedIn = !!user;

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
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white/10 group-hover:ring-emerald-500/50 transition-all duration-300 shadow-lg shadow-emerald-600/20">
                <Image src="/logo.webp" alt="OSK+" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-lg leading-none font-arabic-display">OSK</span>
                <span className="text-emerald-500 font-bold text-lg leading-none font-arabic-display">+</span>
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
                      <span style={active ? { color: p.color } : undefined}>{p.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2">
              {!loading && isSignedIn ? (
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
                  <button
                    onClick={() => setShowDevModal(true)}
                    className="hidden sm:flex w-11 h-11 items-center justify-center rounded-xl hover:bg-white/5 transition-all overflow-hidden ring-1 ring-white/10 hover:ring-emerald-500/30"
                    title="المطور"
                  >
                    <Image src="/developer.webp" alt="المطور" width={28} height={28} className="w-7 h-7 rounded-lg object-cover" />
                  </button>

                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400 truncate max-w-20">{user?.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300 transition-all text-xs font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تسجيل الخروج</span>
                  </button>
                </>
              ) : !loading ? (
                <Link
                  href="/sign-in"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
                >
                  تسجيل الدخول
                </Link>
              ) : null}

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
              <button
                onClick={() => { setMobileOpen(false); setShowDevModal(true); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="w-5 h-5 rounded overflow-hidden shrink-0">
                  <Image src="/developer.webp" alt="المطور" width={20} height={20} className="w-full h-full object-cover" />
                </div>
                المطور
              </button>
            </div>
          </div>
        </div>
      )}

      <DeveloperModal open={showDevModal} onClose={() => setShowDevModal(false)} />
    </>
  );
}
