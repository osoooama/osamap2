'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

const ACCENT = '#E50914';

export default function NetflixPage() {
  const { data: movies, isLoading } = useMovies('foreign');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a] pt-16 lg:pt-20">
        <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
          <div className="absolute inset-0 platform-gradient-netflix" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-7xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/20 flex items-center justify-center">
                  <Film className="w-5 h-5 text-[#E50914]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">Netflix</h1>
                  <p className="text-zinc-400 text-sm sm:text-base">الأفلام والمسلسلات العالمية</p>
                </div>
              </div>
              <p className="text-zinc-500 max-w-2xl text-sm sm:text-base mt-2">
                أحدث الأفلام والمسلسلات العالمية بدقة عالية. اختر ما يناسبك واستمتع بالمشاهدة.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="space-y-6">
            <MovieRow title="الأكثر مشاهدة" subtitle="أشهر الأفلام العالمية هذا الأسبوع" movies={movies || []} accentColor={ACCENT} loading={isLoading} />
            <MovieRow title="وصل حديثاً" subtitle="أحدث الإضافات إلى المكتبة" movies={movies?.slice(0, 10) || []} accentColor={ACCENT} loading={isLoading} />
            <MovieRow title="الأعلى تقييماً" subtitle="أفضل الأفلام حسب تقييمات المشاهدين" movies={movies?.slice(5, 15) || []} accentColor={ACCENT} loading={isLoading} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
