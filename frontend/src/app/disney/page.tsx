'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import InfoModal from '@/components/InfoModal';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const theme = { primary: '#113CCF' };

const slides = [
  { id: 1, title: 'Disney+', subtitle: 'عالم الأنيميشن السحري', genre: 'animation' as const, mediaType: 'movie' as const },
  { id: 2, title: 'Pixar', subtitle: 'قصص لا تُنسى', genre: 'animation' as const, mediaType: 'movie' as const },
  { id: 3, title: 'Marvel', subtitle: 'أبطال خارقون', genre: 'action' as const, mediaType: 'movie' as const },
];

function Banner({ movies, isLoading, onInfo }: { movies: any[]; isLoading: boolean; onInfo: (movie: any) => void }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [direction, setDirection] = useState(0);

  const featured = !isLoading && movies?.length > 0 ? movies[current % movies.length] : null;
  const backdropUrl = featured?.backdrop_path ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}` : null;

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % (movies?.length || 1));
  }, [movies?.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + (movies?.length || 1)) % (movies?.length || 1));
  }, [movies?.length]);

  useEffect(() => {
    if (movies?.length <= 1) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [movies?.length, next]);

  return (
    <div className="relative h-[55vh] sm:h-[65vh] md:h-[75vh] overflow-hidden bg-[#0a0a0a]">
      <AnimatePresence mode="wait" custom={direction}>
        {backdropUrl && (
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -100 : 100 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img src={backdropUrl} alt="" className="w-full h-full object-cover" style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          {/* Disney+ Logo */}
          <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden ring-2 ring-blue-500/20 mb-4 sm:mb-6 shadow-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
            <span className="text-white font-black text-lg sm:text-2xl md:text-3xl tracking-tighter">D+</span>
          </div>

          {featured && (
            <>
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9] mb-2 sm:mb-3">
                {featured.title}
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl mb-2 sm:mb-4 leading-relaxed line-clamp-2">
                {featured.overview}
              </p>

              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                {featured.release_date && (
                  <span className="text-zinc-400 text-xs sm:text-sm">{featured.release_date.split('-')[0]}</span>
                )}
                {featured.vote_average > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                    ★ {featured.vote_average.toFixed(1)}
                  </span>
                )}
                {featured.genre_ids && (
                  <span className="text-zinc-500 text-xs sm:text-sm">
                    {featured.genre_ids.slice(0, 2).map((g: number) => {
                      const names: Record<number, string> = { 28: 'أكشن', 12: 'مغامرة', 16: 'أنيميشن', 35: 'كوميدي', 878: 'خيال علمي', 99: 'وثائقي', 10751: 'عائلي' };
                      return names[g] || '';
                    }).filter(Boolean).join(' • ')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => featured?.tmdb_id && router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=disney`)}
                  className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                  مشاهدة الآن
                </button>
                <button
                  onClick={() => featured && onInfo(featured)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl backdrop-blur-md border border-white/10 transition-all"
                >
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  التفاصيل
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Mute toggle */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function DisneyPage() {
  const { data: animation, isLoading } = useMovies('animation', 1, 'movie');
  const { data: animationTv, isLoading: tvLoading } = useMovies('animation', 1, 'tv');
  const { data: action, isLoading: actionLoading } = useMovies('foreign', 1, 'movie');
  const { data: scifi, isLoading: scifiLoading } = useMovies('foreign', 2, 'movie');
  const { data: comedy, isLoading: comedyLoading } = useMovies('foreign', 3, 'movie');
  const { data: family, isLoading: familyLoading } = useMovies('animation', 2, 'movie');
  const { data: topRated, isLoading: topRatedLoading } = useMovies('animation', 3, 'movie');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const handleOpenInfo = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setModalVisible(false);
    setSelectedMovie(null);
  }, []);

  return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Banner movies={animation || []} isLoading={isLoading} onInfo={handleOpenInfo} />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 pb-12 sm:pb-16">
          <div className="space-y-4 sm:space-y-6">
            <MovieRow title="أفلام أنيميشن" subtitle="أشهر أفلام الكرتون والأنيميشن" movies={animation || []} accentColor={theme.primary} loading={isLoading} platformRef="disney" onInfo={handleOpenInfo} />
            <MovieRow title="مسلسلات أنيميشن" subtitle="مسلسلات كرتونية مميزة" movies={animationTv || []} accentColor={theme.primary} loading={tvLoading} platformRef="disney" onInfo={handleOpenInfo} />
            <MovieRow title="أفلام عالمية" subtitle="أفلام الأكشن والمغامرة" movies={action || []} accentColor={theme.primary} loading={actionLoading} platformRef="disney" onInfo={handleOpenInfo} />
            <MovieRow title="خيال علمي" subtitle="أفلام الخيال العلمي" movies={scifi || []} accentColor={theme.primary} loading={scifiLoading} platformRef="disney" onInfo={handleOpenInfo} />
            <MovieRow title="كوميدي" subtitle="أفلام الكوميديا" movies={comedy || []} accentColor={theme.primary} loading={comedyLoading} platformRef="disney" onInfo={handleOpenInfo} />
            <MovieRow title="عائلي" subtitle="للعائلات والأطفال" movies={family || []} accentColor={theme.primary} loading={familyLoading} platformRef="disney" onInfo={handleOpenInfo} />
            <MovieRow title="الأكثر تقييماً" subtitle="أفضل أفلام الأنيميشن" movies={topRated || []} accentColor={theme.primary} loading={topRatedLoading} platformRef="disney" onInfo={handleOpenInfo} />
          </div>
        </div>

        <InfoModal visible={modalVisible} onClose={handleCloseInfo} movie={selectedMovie} accentColor={theme.primary} platformRef="disney" />
      </div>
  );
}
