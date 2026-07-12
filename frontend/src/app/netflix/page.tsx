'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import { Film, Sparkles, TrendingUp, Star, Clock } from 'lucide-react';

const theme = {
  primary: '#E50914',
  gradient: 'from-[#E50914] via-[#b20710] to-[#831010]',
  bg: 'from-zinc-900 via-black to-zinc-900',
};

function HeroSkeleton() {
  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] bg-zinc-900 animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-10 w-40 bg-zinc-800 rounded-xl" />
          <div className="h-5 w-72 bg-zinc-800 rounded-lg" />
          <div className="h-4 w-96 bg-zinc-800/50 rounded-lg" />
        </div>
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
      <div className="min-h-screen bg-[#0a0a0a] pt-16 lg:pt-20">
        {/* Hero */}
        <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/5 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #E50914 0%, transparent 50%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E50914]/20 to-[#E50914]/5 border border-[#E50914]/10 flex items-center justify-center">
                    <Film className="w-6 h-6 text-[#E50914]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#E50914] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">
                    Netflix
                  </h1>
                  <p className="text-zinc-500 text-sm sm:text-base mt-1">منصة الأفلام والمسلسلات العالمية</p>
                </div>
              </div>
              <p className="text-zinc-600 max-w-xl text-sm sm:text-base leading-relaxed">
                أحدث الأفلام والمسلسلات العالمية بجودة عالية. تصفح مكتبتنا المتنوعة واستمتع بتجربة مشاهدة استثنائية.
              </p>
              <div className="flex gap-3 mt-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.03] text-zinc-500 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                  تحديث يومي
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.03] text-zinc-500 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E50914]" />
                  آلاف العناوين
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Rows */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="space-y-6">
            <MovieRow
              title="أفلام رائجة"
              subtitle="الأكثر مشاهدة هذا الأسبوع"
              movies={movies || []}
              accentColor={theme.primary}
              loading={isLoading}
            />
            <MovieRow
              title="مسلسلات رائجة"
              subtitle="أشهر المسلسلات العالمية"
              movies={tvShows || []}
              accentColor={theme.primary}
              loading={tvLoading}
            />
            <MovieRow
              title="الأكثر تقييماً"
              subtitle="أفضل الأفلام حسب تقييم المشاهدين"
              movies={topRated || []}
              accentColor={theme.primary}
              loading={isLoading}
            />
            {trending && trending.length > 0 && (
              <MovieRow
                title={movies?.[0]?.release_date?.slice(0, 4) === '2026' ? 'أفلام 2026' : 'أحدث الإضافات'}
                subtitle="جديد المكتبة"
                movies={trending}
                accentColor={theme.primary}
                loading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
