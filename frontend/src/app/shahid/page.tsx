'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';

export default function ShahidPage() {
  const { data: arabicMovies, isLoading: amLoading } = useMovies('arabic', 1, 'movie');
  const { data: arabicTv, isLoading: atLoading } = useMovies('arabic', 1, 'tv');
  const { data: turkishMovies, isLoading: tmLoading } = useMovies('turkish', 1, 'movie');
  const { data: turkishTv, isLoading: ttLoading } = useMovies('turkish', 1, 'tv');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a] pt-16 lg:pt-20">
        <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
          <div className="absolute inset-0 platform-gradient-shahid" />
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
                <div className="w-10 h-10 rounded-xl bg-[#00ca97]/20 flex items-center justify-center">
                  <Tv className="w-5 h-5 text-[#00ca97]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">Shahid</h1>
                  <p className="text-zinc-400 text-sm sm:text-base">المحتوى العربي والتركي</p>
                </div>
              </div>
              <p className="text-zinc-500 max-w-2xl text-sm sm:text-base mt-2">
                أشهر الأفلام والمسلسلات العربية والتركية. محتوى متنوع يناسب جميع الأذواق.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="space-y-8">
            {/* Arabic Content */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 rounded-full bg-[#00ca97]" />
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">عربي</span>
              </div>
            </div>
            <MovieRow title="أفلام عربية" subtitle="أحدث الأفلام العربية" movies={arabicMovies || []} accentColor="#00ca97" loading={amLoading} />
            <MovieRow title="مسلسلات عربية" subtitle="أشهر المسلسلات العربية" movies={arabicTv || []} accentColor="#00ca97" loading={atLoading} />

            {/* Turkish Content */}
            <div className="mb-2 mt-8">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 rounded-full bg-[#0098fe]" />
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">تركي</span>
              </div>
            </div>
            <MovieRow title="أفلام تركية" subtitle="أحدث الأفلام التركية" movies={turkishMovies || []} accentColor="#0098fe" loading={tmLoading} />
            <MovieRow title="مسلسلات تركية" subtitle="أشهر المسلسلات التركية" movies={turkishTv || []} accentColor="#0098fe" loading={ttLoading} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
