'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import { Clapperboard } from 'lucide-react';

const ACCENT = '#F47521';

export default function CrunchyrollPage() {
  const { data: animeMovies, isLoading: amLoading } = useMovies('anime', 1, 'movie');
  const { data: animeTv, isLoading: atLoading } = useMovies('anime', 1, 'tv');
  const { data: trending, isLoading: trLoading } = useMovies('anime', 2);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a] pt-16 lg:pt-20">
        <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
          <div className="absolute inset-0 platform-gradient-crunchyroll" />
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
                <div className="w-10 h-10 rounded-xl bg-[#F47521]/20 flex items-center justify-center">
                  <Clapperboard className="w-5 h-5 text-[#F47521]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">Crunchyroll</h1>
                  <p className="text-zinc-400 text-sm sm:text-base">أفلام ومسلسلات الأنمي</p>
                </div>
              </div>
              <p className="text-zinc-500 max-w-2xl text-sm sm:text-base mt-2">
                أشهر مسلسلات وأفلام الأنمي. استمتع بعالم الأنمي الواسع حصرياً على منصتنا.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="space-y-8">
            <MovieRow title="مسلسلات أنمي" subtitle="أشهر مسلسلات الأنمي هذا الموسم" movies={animeTv || []} accentColor={ACCENT} loading={atLoading} />
            <MovieRow title="أفلام أنمي" subtitle="أجمل أفلام الأنمي" movies={animeMovies || []} accentColor={ACCENT} loading={amLoading} />
            {trending && trending.length > 0 && (
              <MovieRow title="أنمي رائج" subtitle="الأكثر مشاهدة الآن" movies={trending} accentColor={ACCENT} loading={trLoading} />
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
