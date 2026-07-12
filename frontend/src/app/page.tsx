'use client';

import { useUser } from '@clerk/clerk-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, LogIn, Play, Lock, ArrowRight, Globe, Languages, Palette, Atom } from 'lucide-react';
import { useState, useEffect } from 'react';

const platforms = [
  {
    name: 'Netflix',
    tagline: 'أفلام ومسلسلات عالمية',
    href: '/netflix',
    color: '#E50914',
    logo: '/netflix.webp',
    icon: Globe,
    desc: 'أفلام ومسلسلات عالمية فقط',
    bgGradient: 'platform-gradient-netflix',
  },
  {
    name: 'Shahid',
    tagline: 'عربي + تركي',
    href: '/shahid',
    color: '#00ca97',
    logo: '/shahid.webp',
    icon: Languages,
    desc: 'مسلسلات وأفلام عربية وتركية',
    bgGradient: 'platform-gradient-shahid',
  },
  {
    name: 'Disney+',
    tagline: 'أنيميشن فقط',
    href: '/disney',
    color: '#113CCF',
    logo: '/disney.webp',
    icon: Palette,
    desc: 'أفلام أنيميشن عالمية وforeign',
    bgGradient: 'platform-gradient-disney',
  },
  {
    name: 'Crunchyroll',
    tagline: 'أنمي فقط',
    href: '/crunchyroll',
    color: '#F47521',
    logo: '/crunchyroll.webp',
    icon: Atom,
    desc: 'مسلسلات وأفلام وفلرات أنمي',
    bgGradient: 'platform-gradient-crunchyroll',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)' }}
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(17,60,207,0.12) 0%, transparent 70%)' }}
        animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[30%] right-[15%] w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(244,117,33,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[50%] left-[20%] w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,202,151,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
    </div>
  );
}

function PlatformCard({ p, index, isSignedIn }: { p: typeof platforms[0]; index: number; isSignedIn: boolean }) {
  return (
    <motion.div variants={itemVariants} custom={index}>
      <Link href={isSignedIn ? p.href : '/sign-in'} className="group block">
        <div
          className={`relative h-[320px] sm:h-[380px] rounded-2xl overflow-hidden transition-all duration-500 ${p.bgGradient} border border-white/5 hover:border-white/20`}
        >
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse at center, ${p.color}25, transparent 70%)` }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              className="w-24 h-24 rounded-2xl overflow-hidden mb-5 ring-2 ring-white/5 group-hover:ring-white/20 transition-all"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <Image src={p.logo} alt={p.name} width={96} height={96} className="w-full h-full object-cover" />
              {!isSignedIn && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-zinc-400" />
                </div>
              )}
            </motion.div>

            <h3 className="text-2xl font-bold text-white mb-1">{p.name}</h3>
            <p className="text-sm font-medium mb-3" style={{ color: p.color }}>{p.tagline}</p>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[200px]">{p.desc}</p>

            {!isSignedIn && (
              <motion.div
                className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full glass text-zinc-400 text-xs"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
              >
                <Lock className="w-3 h-3" />
                <span>سجل الدخول للوصول</span>
              </motion.div>
            )}
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            style={{ backgroundColor: p.color }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => setShowContent(true), 100);
    }
  }, [isLoaded]);

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-[#0a0a0a] relative overflow-hidden"
        >
          <FloatingOrbs />

          {/* Hero Section */}
          <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center max-w-5xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-zinc-300 text-sm mb-8 border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>منصة البث المتكاملة - 4 منصات في مكان واحد</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-center justify-center gap-6 mb-6"
              >
                <motion.div
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white/10 shadow-2xl shadow-red-600/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <Image src="/logo.webp" alt="OSK+" width={112} height={112} className="w-full h-full object-cover" />
                </motion.div>
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tight">
                  OSK
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
                    +
                  </span>
                </h1>
              </motion.div>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                أربع منصات عالمية في مكان واحد.{' '}
                <span className="text-white font-semibold">أفلام، مسلسلات، أنمي، وأنيميشن</span>
                <br className="hidden sm:block" />
                كل ما تريد بمشغل فيديو متطور وجودة عالية.
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {isSignedIn ? (
                  <Link
                    href="/netflix"
                    className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-red-600/25 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Play className="w-5 h-5 fill-white" />
                      ابدأ المشاهدة
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-red-600/25"
                  >
                    <span className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      سجل الدخول الآن
                    </span>
                  </Link>
                )}

                {isSignedIn && (
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl glass text-zinc-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm">تم تسجيل الدخول</span>
                  </div>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute bottom-8"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-6 h-6 text-zinc-600" />
            </motion.div>
          </section>

          {/* Platforms Section */}
          <section className="relative px-4 sm:px-6 lg:px-8 pb-32">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="max-w-7xl mx-auto"
            >
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  {isSignedIn ? 'اختر منصتك المفضلة' : 'اكتشف منصاتنا'}
                </h2>
                <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                  {isSignedIn
                    ? 'كل منصة لها هويتها ومحتواها الخاص، اختر ما يناسبك'
                    : 'سجل دخولك واستمتع بأربع منصات بث حصرية'}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {platforms.map((p, i) => (
                  <PlatformCard key={p.name} p={p} index={i} isSignedIn={!!isSignedIn} />
                ))}
              </div>
            </motion.div>
          </section>

          {/* Stats Section (only for non-signed-in) */}
          {!isSignedIn && (
            <section className="relative px-4 sm:px-6 lg:px-8 pb-32">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { number: '4', label: 'منصات بث', color: '#E50914' },
                    { number: '80+', label: 'موقع زحف', color: '#00ca97' },
                    { number: '10K+', label: 'فيلم ومسلسل', color: '#113CCF' },
                    { number: '16', label: 'مزود تشغيل', color: '#F47521' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="glass rounded-2xl p-6 text-center hover:border-white/20 transition-all duration-300"
                    >
                      <p className="text-3xl sm:text-4xl font-black mb-1" style={{ color: stat.color }}>
                        {stat.number}
                      </p>
                      <p className="text-zinc-500 text-sm">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
