'use client';

import { useUser } from '@clerk/clerk-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GitBranch, Mail, Globe, Code, ChevronLeft, Award, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function DeveloperPage() {
  const { isSignedIn } = useUser();

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
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-600/10 flex items-center justify-center shrink-0">
              <span className="text-4xl sm:text-5xl font-black text-red-500">O</span>
            </div>
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
                  Full-Stack Developer
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-xs border border-white/5">
                  <Code className="w-3.5 h-3.5 text-emerald-500" />
                  Python & Next.js
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-xs border border-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  UI/UX
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
            <p className="text-zinc-600 text-[10px] mt-1">OSK+ Platform</p>
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
    </div>
  );
}
