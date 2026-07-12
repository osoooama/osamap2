'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Play, Info } from 'lucide-react';
import Image from 'next/image';

const theme = { primary: '#113CCF' };

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
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(17,60,207,0.08) 0%, transparent 40%)' }} />

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
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-blue-500/20 mb-5 shadow-2xl"
          >
            <Image src="/disney.webp" alt="Disney+" width={80} height={80} className="w-full h-full object-cover" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9] mb-3">
            Disney+
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-xl mb-4 leading-relaxed">
            أفلام ومسلسلات أنيميشن عالمية وأجنبية فقط. محتوى مخصص لعشاق الكرتون والأنيميشن.
          </p>

          {featured && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{featured.title}</h2>
              <p className="text-zinc-400 text-sm max-w-xl line-clamp-2">{featured.overview}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => featured?.tmdb_id && router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=disney`)}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30"
            >
              <Play className="w-5 h-5 fill-white" />
              مشاهدة الآن
            </button>
            {featured?.tmdb_id && (
              <button
                onClick={() => router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=disney`)}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl backdrop-blur-md border border-white/10 transition-all"
              >
                <Info className="w-5 h-5" />
                التفاصيل
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              أنيميشن فقط
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]">
              عالمي + foreign
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DisneyPage() {
  const { data: movies, isLoading } = useMovies('animation', 1, 'movie');
  const { data: tvSeries, isLoading: tvLoading } = useMovies('animation', 1, 'tv');
  const { data: topRated } = useMovies('animation', 2, 'movie');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Billboard movies={movies || []} isLoading={isLoading} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
          <div className="space-y-6">
            <MovieRow title="أفلام أنيميشن" subtitle="أشهر أفلام الكرتون والأنيميشن" movies={movies || []} accentColor={theme.primary} loading={isLoading} platformRef="disney" />
            <MovieRow title="مسلسلات أنيميشن" subtitle="مسلسلات كرتونية مميزة" movies={tvSeries || []} accentColor={theme.primary} loading={tvLoading} platformRef="disney" />
            <MovieRow title="الأكثر تقييماً" subtitle="أفضل أفلام الأنيميشن" movies={topRated || []} accentColor={theme.primary} loading={isLoading} platformRef="disney" />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
