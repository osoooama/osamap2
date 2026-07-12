'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';

export default function ShahidPage() {
  const { data: arabic, isLoading: arabicLoading } = useMovies('arabic');
  const { data: turkish, isLoading: turkishLoading } = useMovies('turkish');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a] pt-16 lg:pt-20">
        {/* Hero Billboard */}
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

        {/* Content Rows */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="space-y-6">
            <MovieRow
              title="أفلام عربية"
              subtitle="أحدث الأفلام العربية الحصرية"
              movies={arabic || []}
              accentColor="#00ca97"
              loading={arabicLoading}
            />
            <MovieRow
              title="مسلسلات عربية"
              subtitle="أشهر المسلسلات العربية"
              movies={arabic?.slice(0, 10) || []}
              accentColor="#00ca97"
              loading={arabicLoading}
            />
            <MovieRow
              title="المحتوى التركي"
              subtitle="أفلام ومسلسلات تركية مدبلجة ومترجمة"
              movies={turkish || []}
              accentColor="#0098fe"
              loading={turkishLoading}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
