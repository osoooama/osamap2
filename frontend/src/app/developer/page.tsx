'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Mail, Globe, Code, ChevronLeft, Award, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function DeveloperPage() {
  const { user } = useAuth();
  const isSignedIn = !!user;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,202,151,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href={isSignedIn ? '/netflix' : '/'} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="text-sm">العودة للرئيسية</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-28 h-28 rounded-3xl overflow-hidden mx-auto mb-6 ring-4 ring-red-500/20 shadow-2xl shadow-red-600/20"
          >
            <Image src="/logo.webp" alt="OSK+" width={112} height={112} className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            OSK<span className="text-red-500">+</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">منصة البث المتكاملة - أربع منصات في مكان واحد</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8 sm:p-10 border border-white/5 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <button
              onClick={() => setShowModal(true)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-red-500/30 hover:border-red-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 shrink-0 cursor-pointer"
            >
              <Image
                src="/developer.webp"
                alt="أسامة كريشان"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            </button>
            <div className="text-center sm:text-right">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">أسامة كريشان</h2>
              <p className="text-zinc-500 text-sm mb-3">Osama Kreishan</p>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                مطور برمجيات ومهندس أنظمة زحف. متخصص في تطوير منصات البث المباشر،
                أنظمة الزحف (Web Scraping)، وتكامل واجهات APIs. مؤسس OSK+.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-xs border border-white/5">
                  <Award className="w-3.5 h-3.5 text-red-500" />
                  مطور واجهات أمامية وخلفية
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-xs border border-white/5">
                  <Code className="w-3.5 h-3.5 text-emerald-500" />
                  بايثون و Next.js
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-xs border border-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  تصميم واجهات المستخدم
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <a href="mailto:osamakreshan49@gmail.com" className="glass rounded-2xl p-5 border border-white/5 hover:border-red-500/20 transition-all duration-300 group text-center">
            <Mail className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs group-hover:text-white transition">البريد الإلكتروني</p>
            <p className="text-zinc-600 text-[10px] mt-1">osamakreshan49@gmail.com</p>
          </a>
          <a href="https://github.com/osoooama" target="_blank" className="glass rounded-2xl p-5 border border-white/5 hover:border-emerald-500/20 transition-all duration-300 group text-center">
            <GitBranch className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs group-hover:text-white transition">GitHub</p>
            <p className="text-zinc-600 text-[10px] mt-1">@osoooama</p>
          </a>
          <a href="#" className="glass rounded-2xl p-5 border border-white/5 hover:border-blue-500/20 transition-all duration-300 group text-center">
            <Globe className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs group-hover:text-white transition">الموقع</p>
            <p className="text-zinc-600 text-[10px] mt-1">منصة OSK+</p>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-8 border border-white/5"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-red-500" />
            التقنيات المستخدمة في OSK+
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Next.js 16', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'Clerk Auth', 'MongoDB', 'Python', 'Playwright', 'TMDB API', 'Cloudflare Pages'].map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-xs border border-white/5 hover:bg-zinc-800 hover:text-white transition">
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-zinc-600 text-xs text-center">
              © {new Date().getFullYear()} OSK+. جميع الحقوق محفوظة. | المطور: أسامة كريشان
            </p>
          </div>
        </motion.div>
      </div>

      {/* Developer Info Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setShowModal(false)}
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
                onClick={() => setShowModal(false)}
                className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="relative h-48 bg-gradient-to-br from-red-600/20 via-zinc-900 to-emerald-600/10">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-zinc-900 shadow-2xl">
                    <Image src="/developer.webp" alt="أسامة كريشان" width={128} height={128} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-6 px-6 text-center">
                <h2 className="text-2xl font-black text-white mb-1">أسامة كريشان</h2>
                <p className="text-zinc-500 text-sm mb-4">Osama Kreishan</p>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  مطور برمجيات全-stack متخصص في بناء منصات البث المباشر وأنظمة الزحف المؤتمتة. مؤسس منصة OSK+.
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/20">مطور Full-Stack</span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Python</span>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">Next.js</span>
                  <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">Playwright</span>
                  <span className="px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">MongoDB</span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <a href="mailto:osamakreshan49@gmail.com" className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 hover:border-red-500/20 transition">
                    <Mail className="w-4 h-4 text-zinc-400" />
                  </a>
                  <a href="https://github.com/osoooama" target="_blank" className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 hover:border-emerald-500/20 transition">
                    <GitBranch className="w-4 h-4 text-zinc-400" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
