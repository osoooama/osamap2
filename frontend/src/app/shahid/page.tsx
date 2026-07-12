'use client';

import { useState, useEffect } from 'react';
import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Info, Lock, KeyRound, CheckCircle, X } from 'lucide-react';
import Image from 'next/image';

const ACCESS_CODE = '2026';
const STORAGE_KEY = 'osk_shahid_access';

const theme = { primary: '#00ca97' };

function ShahidLock() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') setUnlocked(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setUnlocked(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      setError('');
    } else {
      setError('كود الدخول غير صحيح');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-6 ring-4 ring-emerald-500/20 shadow-2xl"
        >
          <Image src="/shahid.webp" alt="Shahid" width={96} height={96} className="w-full h-full object-cover" />
        </motion.div>
        <h1 className="text-4xl font-black text-white mb-2">Shahid</h1>
        <p className="text-emerald-500 font-semibold text-lg mb-2">قريباً</p>
        <p className="text-zinc-500 text-sm mb-8">هذه المنصة قيد التطوير. أدخل كود الدخول للوصول المبكر.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="أدخل كود الدخول"
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-white text-center text-lg font-bold tracking-[0.3em] focus:outline-none focus:border-emerald-500/50 transition placeholder:text-zinc-700"
              autoFocus
              maxLength={10}
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-5 h-5" />
            فتح المنصة
          </button>
        </form>

        <p className="text-zinc-700 text-xs mt-6">المحتوى العربي والتركي قادم قريباً</p>
      </motion.div>
    </div>
  );
}

function Billboard({ movies, isLoading }: { movies: any[]; isLoading: boolean }) {
  const router = useRouter();
  const featured = !isLoading && movies?.length > 0 ? movies[0] : null;
  const backdropUrl = featured?.backdrop_path ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}` : null;

  return (
    <div className="relative h-[60vh] sm:h-[65vh] md:h-[75vh] overflow-hidden">
      {backdropUrl && (
        <div className="absolute inset-0">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,202,151,0.08) 0%, transparent 40%)' }} />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-emerald-500/20 mb-5 shadow-2xl"
          >
            <Image src="/shahid.webp" alt="Shahid" width={80} height={80} className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9] mb-3">Shahid</h1>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-xl mb-4 leading-relaxed">مسلسلات وأفلام عربية وتركية فقط. محتوى مخصص للعالم العربي.</p>
          {featured && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{featured.title}</h2>
              <p className="text-zinc-400 text-sm max-w-xl line-clamp-2">{featured.overview}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => featured?.tmdb_id && router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=shahid`)}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/30"
            >
              <Play className="w-5 h-5 fill-white" /> مشاهدة الآن
            </button>
            {featured?.tmdb_id && (
              <button
                onClick={() => router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=shahid`)}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl backdrop-blur-md border border-white/10 transition-all"
              >
                <Info className="w-5 h-5" /> التفاصيل
              </button>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> عربي + تركي</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]">مسلسلات + أفلام</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ShahidContent() {
  const { data: arabicMovies, isLoading: arabicLoading } = useMovies('arabic', 1, 'movie');
  const { data: arabicSeries, isLoading: seriesLoading } = useMovies('arabic', 1, 'tv');
  const { data: turkishSeries, isLoading: turkishLoading } = useMovies('turkish', 1, 'tv');
  const { data: turkishMovies, isLoading: turkishMoviesLoading } = useMovies('turkish', 1, 'movie');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Billboard movies={arabicMovies || []} isLoading={arabicLoading} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
        <div className="space-y-6">
          <MovieRow title="أفلام عربية" subtitle="أحدث الأفلام العربية" movies={arabicMovies || []} accentColor={theme.primary} loading={arabicLoading} platformRef="shahid" />
          <MovieRow title="مسلسلات عربية" subtitle="أشهر المسلسلات العربية" movies={arabicSeries || []} accentColor={theme.primary} loading={seriesLoading} platformRef="shahid" />
          <MovieRow title="مسلسلات تركية" subtitle="أحدث المسلسلات التركية" movies={turkishSeries || []} accentColor="#f59e0b" loading={turkishLoading} platformRef="shahid" />
          <MovieRow title="أفلام تركية" subtitle="أفلام تركية مميزة" movies={turkishMovies || []} accentColor="#f59e0b" loading={turkishMoviesLoading} platformRef="shahid" />
        </div>
      </div>
    </div>
  );
}

export default function ShahidPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    setHasAccess(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  return (
    <AuthGuard>
      {hasAccess === null ? (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-3 border-emerald-600/20 rounded-full" />
            <div className="absolute inset-0 border-3 border-transparent border-t-emerald-600 rounded-full animate-spin" />
          </div>
        </div>
      ) : hasAccess ? (
        <ShahidContent />
      ) : (
        <ShahidLock />
      )}
    </AuthGuard>
  );
}
