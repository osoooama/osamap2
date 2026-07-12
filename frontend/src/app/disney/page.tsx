'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Star, Clapperboard } from 'lucide-react';

const theme = {
  primary: '#1d4ed8',
  gradient: 'from-blue-600 via-blue-700 to-indigo-800',
  bg: 'from-zinc-900 via-black to-zinc-900',
};

export default function DisneyPage() {
  const { data: movies, isLoading } = useMovies('animation', 1, 'movie');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a] pt-16 lg:pt-20">
        {/* Hero */}
        <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #1d4ed8 0%, transparent 50%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/10 flex items-center justify-center">
                    <Clapperboard className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">Disney+</h1>
                  <p className="text-zinc-500 text-sm sm:text-base mt-1">أفلام الأنيميشن والكرتون</p>
                </div>
              </div>
              <p className="text-zinc-600 max-w-xl text-sm sm:text-base leading-relaxed">
                عالم من السحر والخيال. أشهر أفلام الأنيميشن والكرتون لكل أفراد العائلة.
              </p>
              <div className="flex gap-3 mt-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.03] text-zinc-500 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  كلاسيكيات ديزني
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.03] text-zinc-500 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  أحدث الإصدارات
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Rows */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="space-y-6">
            <MovieRow title="أفلام الأنيميشن" subtitle="أشهر أفلام الكرتون والأنيميشن" movies={movies || []} accentColor={theme.primary} loading={isLoading} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
