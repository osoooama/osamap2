'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Play, Info } from 'lucide-react';
import Image from 'next/image';

const theme = { primary: '#E50914' };

function Billboard({ movies, isLoading }: { movies: any[]; isLoading: boolean }) {
  const router = useRouter();
  const featured = !isLoading && movies?.length > 0 ? movies[0] : null;
  const backdropUrl = featured?.backdrop_path ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}` : null;

  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
      {backdropUrl && (
        <div className="absolute inset-0">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(229,9,20,0.08) 0%, transparent 40%)' }} />

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-14 lg:p-20">
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
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden ring-2 ring-red-500/20 mb-3 sm:mb-5 shadow-2xl"
          >
            <Image src="/netflix.webp" alt="Netflix" width={80} height={80} className="w-full h-full object-cover" />
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9] mb-2 sm:mb-3">
            Netflix
          </h1>
          <p className="text-zinc-400 text-xs sm:text-base md:text-lg max-w-xl mb-3 sm:mb-4 leading-relaxed">
            أحدث الأفلام والمسلسلات العالمية. محتوى أجنبي حصري.
          </p>

          {featured && (
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2">{featured.title}</h2>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-xl line-clamp-2">{featured.overview}</p>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => featured?.tmdb_id && router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=netflix`)}
              className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              مشاهدة الآن
            </button>
            {featured?.tmdb_id && (
              <button
                onClick={() => router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=netflix`)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl backdrop-blur-md border border-white/10 transition-all"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                التفاصيل
              </button>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
            <span className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/5 text-zinc-400 text-[10px] sm:text-xs border border-white/[0.03]">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
              عالمي فقط
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/5 text-zinc-400 text-[10px] sm:text-xs border border-white/[0.03]">
              أفلام + مسلسلات
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function NetflixPage() {
  const { data: movies, isLoading } = useMovies('foreign', 1, 'movie');
  const { data: tvShows, isLoading: tvLoading } = useMovies('foreign', 1, 'tv');
  const { data: trending } = useMovies('foreign', 2, 'movie');
  const { data: topRated } = useMovies('foreign', 3, 'movie');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Billboard movies={movies || []} isLoading={isLoading} />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 pb-12 sm:pb-16">
          <div className="space-y-4 sm:space-y-6">
            <MovieRow title="أفلام عالمية" subtitle="الأكثر مشاهدة هذا الأسبوع" movies={movies || []} accentColor={theme.primary} loading={isLoading} platformRef="netflix" />
            <MovieRow title="مسلسلات عالمية" subtitle="أشهر المسلسلات العالمية" movies={tvShows || []} accentColor={theme.primary} loading={tvLoading} platformRef="netflix" />
            <MovieRow title="الأكثر تقييماً" subtitle="أفضل الأفلام العالمية" movies={topRated || []} accentColor={theme.primary} loading={isLoading} platformRef="netflix" />
            {trending && trending.length > 0 && (
              <MovieRow title={movies?.[0]?.release_date?.slice(0, 4) === '2026' ? 'أفلام 2026' : 'أحدث الإضافات'} subtitle="جديد المكتبة" movies={trending} accentColor={theme.primary} loading={isLoading} platformRef="netflix" />
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
