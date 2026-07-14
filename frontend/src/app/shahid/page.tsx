'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import InfoModal from '@/components/InfoModal';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Info, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';

const theme = { primary: '#00ca97', secondary: '#0098fe' };

function Billboard({ movies, isLoading, onInfo }: { movies: any[]; isLoading: boolean; onInfo: (movie: any) => void }) {
  const router = useRouter();
  const featured = !isLoading && movies?.length > 0 ? movies[0] : null;
  const backdropUrl = featured?.backdrop_path ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}` : null;
  const [isMuted, setIsMuted] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const descTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!featured) return;
    setShowDescription(true);
    if (descTimer.current) clearTimeout(descTimer.current);
    descTimer.current = setTimeout(() => setShowDescription(false), 5000);
    return () => { if (descTimer.current) clearTimeout(descTimer.current); };
  }, [featured?.tmdb_id]);

  const goToPlayer = useCallback(() => {
    if (featured?.tmdb_id) {
      router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=shahid`);
    }
  }, [featured, router]);

  return (
    <div className="relative h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-black">
      {backdropUrl && (
        <div className="absolute inset-0">
          <motion.img
            key={featured?.tmdb_id}
            src={backdropUrl}
            alt=""
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: imageLoaded ? 1 : 1.05, opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
      <div className="absolute top-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(180deg, rgba(0,202,151,0.12) 0%, transparent 100%)' }} />

      <div className="absolute bottom-[12%] sm:bottom-[15%] left-0 right-0 px-4 sm:px-8 md:px-14 lg:px-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-2 mb-3 sm:mb-4"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <Image src="/shahid.webp" alt="Shahid" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <span className="text-emerald-400 text-xs sm:text-sm font-bold tracking-wider">SHAHID</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={featured?.tmdb_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-2 sm:mb-3 drop-shadow-2xl"
            >
              {featured?.title || 'Shahid'}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showDescription && featured?.overview && (
              <motion.p
                key={featured?.tmdb_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-zinc-300 text-xs sm:text-sm md:text-base max-w-lg line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4 sm:mb-6 drop-shadow-lg"
              >
                {featured.overview}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-xs sm:text-sm"
          >
            {featured?.vote_average && (
              <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">
                <Sparkles className="w-3 h-3" />
                {featured.vote_average.toFixed(1)}
              </span>
            )}
            {featured?.release_date && (
              <span className="text-zinc-400">{featured.release_date.slice(0, 4)}</span>
            )}
            {featured?.media_type === 'tv' && (
              <span className="text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md">مسلسل</span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <button
              onClick={goToPlayer}
              className="flex items-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 8px 24px ${theme.primary}40` }}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              مشاهدة الآن
            </button>
            <button
              onClick={() => onInfo(featured)}
              className="flex items-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300 active:scale-95"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              مزيد من المعلومات
            </button>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-[12%] sm:bottom-[15%] right-4 sm:right-8 md:right-14 lg:right-20">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 sm:w-11 sm:h-11 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 transition-all duration-300 bg-black/30 backdrop-blur-sm hover:bg-black/50"
        >
          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ShahidPage() {
  const { data: arabicMovies, isLoading: arabicLoading } = useMovies('arabic', 1, 'movie');
  const { data: arabicSeries, isLoading: seriesLoading } = useMovies('arabic', 1, 'tv');
  const { data: turkishSeries, isLoading: turkishLoading } = useMovies('turkish', 1, 'tv');
  const { data: turkishMovies, isLoading: turkishMoviesLoading } = useMovies('turkish', 1, 'movie');

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
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Billboard movies={arabicMovies || []} isLoading={arabicLoading} onInfo={handleOpenInfo} />

        <div className="relative z-10 -mt-16 sm:-mt-24 md:-mt-32">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-5 sm:space-y-8">
            <MovieRow title="أفلام عربية" subtitle="أحدث الأفلام العربية" movies={arabicMovies || []} accentColor={theme.primary} loading={arabicLoading} platformRef="shahid" onInfo={handleOpenInfo} />
            <MovieRow title="مسلسلات عربية" subtitle="أشهر المسلسلات العربية" movies={arabicSeries || []} accentColor={theme.primary} loading={seriesLoading} platformRef="shahid" onInfo={handleOpenInfo} />
            <MovieRow title="مسلسلات تركية" subtitle="أحدث المسلسلات التركية" movies={turkishSeries || []} accentColor="#f59e0b" loading={turkishLoading} platformRef="shahid" onInfo={handleOpenInfo} />
            <MovieRow title="أفلام تركية" subtitle="أفلام تركية مميزة" movies={turkishMovies || []} accentColor="#f59e0b" loading={turkishMoviesLoading} platformRef="shahid" onInfo={handleOpenInfo} />
          </div>
        </div>

        <InfoModal visible={modalVisible} onClose={handleCloseInfo} movie={selectedMovie} accentColor={theme.primary} platformRef="shahid" />
      </div>
    </AuthGuard>
  );
}
