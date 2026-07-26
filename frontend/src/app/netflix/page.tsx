'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import Top10Row from '@/components/Top10Row';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import NetflixFooter from '@/components/NetflixFooter';
import InfoModal from '@/components/InfoModal';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const theme = { primary: '#E50914' };

const GENRES = [
  { label: 'الكل', value: 'all' },
  { label: 'أكشن', value: 'action' },
  { label: 'كوميدي', value: 'comedy' },
  { label: 'دراما', value: 'drama' },
  { label: 'رعب', value: 'horror' },
  { label: 'خيال علمي', value: 'scifi' },
  { label: 'رومانسي', value: 'romance' },
  { label: 'مغامرة', value: 'adventure' },
  { label: 'حركة', value: 'thriller' },
  { label: '.family', value: 'family' },
  { label: 'وثائقي', value: 'documentary' },
];

function getMatchPercent(movie: any): number {
  if (!movie?.vote_average) return 0;
  return Math.round(movie.vote_average * 10);
}

function Billboard({ movies, isLoading, onInfo }: { movies: any[]; isLoading: boolean; onInfo: (movie: any) => void }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const featuredMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    return movies.slice(0, 5);
  }, [movies]);

  const featured = featuredMovies[currentIndex] || null;
  const backdropUrl = featured?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}`
    : null;

  useEffect(() => {
    if (featuredMovies.length <= 1 || isPaused) return;
    intervalRef.current = setInterval(() => {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [featuredMovies.length, isPaused]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const goToPlayer = useCallback(() => {
    if (featured?.tmdb_id) {
      router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'movie'}&ref=netflix`);
    }
  }, [featured, router]);

  const matchPercent = getMatchPercent(featured);

  return (
    <div
      className="relative h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="sync">
        {backdropUrl && (
          <motion.div
            key={featured?.tmdb_id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 1.08 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <img
              src={backdropUrl}
              alt=""
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
      <div className="absolute top-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(180deg, rgba(229,9,20,0.12) 0%, transparent 100%)' }} />

      <div className="absolute bottom-[12%] sm:bottom-[15%] left-0 right-0 px-4 sm:px-8 md:px-14 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured?.tmdb_id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-2 mb-3 sm:mb-4"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden ring-1 ring-red-500/30 shadow-lg shadow-red-500/20">
                <Image src="/netflix.webp" alt="Netflix" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="text-red-500 text-xs sm:text-sm font-bold tracking-wider">NETFLIX</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-2 sm:mb-3 drop-shadow-2xl"
            >
              {featured?.title || 'Netflix'}
            </motion.h1>

            {featured?.overview && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-zinc-300 text-xs sm:text-sm md:text-base max-w-lg line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4 sm:mb-6 drop-shadow-lg"
              >
                {featured.overview}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-xs sm:text-sm"
            >
              {matchPercent > 0 && (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  {matchPercent}% Match
                </span>
              )}
              {featured?.release_date && (
                <span className="text-zinc-400">{featured.release_date.slice(0, 4)}</span>
              )}
              {featured?.media_type === 'tv' && (
                <span className="text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded text-[10px] border border-white/10">مسلسل</span>
              )}
              {featured?.vote_average && (
                <span className="text-zinc-400 border border-zinc-600 px-1 py-0.5 rounded text-[10px]">13+</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <button
                onClick={goToPlayer}
                className="flex items-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 bg-white hover:bg-white/90 text-black font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-95"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
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
        </AnimatePresence>
      </div>

      <div className="absolute bottom-[12%] sm:bottom-[15%] right-4 sm:right-8 md:right-14 lg:right-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 transition-all duration-300 bg-black/30 backdrop-blur-sm hover:bg-black/50"
        >
          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        </button>
      </div>

      {/* Rotation indicators */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
          {featuredMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => { setImageLoaded(false); setCurrentIndex(i); }}
              className={`h-0.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      )}

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

function GenrePills({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {GENRES.map((g) => (
        <button
          key={g.value}
          onClick={() => onSelect(g.value)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border ${
            selected === g.value
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-zinc-400 border-white/20 hover:border-white/50 hover:text-white'
          }`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

export default function NetflixPage() {
  const { data: movies, isLoading } = useMovies('foreign', 1, 'movie');
  const { data: tvShows, isLoading: tvLoading } = useMovies('foreign', 1, 'tv');
  const { data: trending } = useMovies('foreign', 2, 'movie');
  const { data: topRated } = useMovies('foreign', 2, 'movie');
  const { data: actionMovies } = useMovies('foreign', 3, 'movie');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedGenre, setSelectedGenre] = useState('all');

  const handleOpenInfo = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setModalVisible(false);
    setSelectedMovie(null);
  }, []);

  const top10Movies = useMemo(() => {
    const source = [...(movies || [])].sort((a, b) => (b?.vote_average || 0) - (a?.vote_average || 0));
    return source.slice(0, 10);
  }, [movies]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Billboard movies={movies || []} isLoading={isLoading} onInfo={handleOpenInfo} />

      <div className="relative z-10 -mt-16 sm:-mt-24 md:-mt-32">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-5 sm:space-y-8">
          <GenrePills selected={selectedGenre} onSelect={setSelectedGenre} />

          <ContinueWatchingRow onInfo={handleOpenInfo} />

          <Top10Row
            title="Top 10 اليوم"
            subtitle="الأكثر مشاهدة في مصر"
            movies={top10Movies}
            accentColor={theme.primary}
            onInfo={handleOpenInfo}
          />

          <MovieRow
            title="أفلام عالمية"
            subtitle="الأكثر مشاهدة هذا الأسبوع"
            movies={movies || []}
            accentColor={theme.primary}
            loading={isLoading}
            platformRef="netflix"
            onInfo={handleOpenInfo}
          />
          <MovieRow
            title="مسلسلات عالمية"
            subtitle="أشهر المسلسلات العالمية"
            movies={tvShows || []}
            accentColor={theme.primary}
            loading={tvLoading}
            platformRef="netflix"
            onInfo={handleOpenInfo}
          />
          <MovieRow
            title="الأكثر تقييماً"
            subtitle="أفضل الأفلام العالمية"
            movies={topRated || []}
            accentColor={theme.primary}
            loading={isLoading}
            platformRef="netflix"
            onInfo={handleOpenInfo}
          />
          {actionMovies && actionMovies.length > 0 && (
            <MovieRow
              title="أكشن ومغامرة"
              subtitle="لمحبي الأكشن"
              movies={actionMovies}
              accentColor={theme.primary}
              loading={isLoading}
              platformRef="netflix"
              onInfo={handleOpenInfo}
            />
          )}
          {trending && trending.length > 0 && (
            <MovieRow
              title="أحدث الإضافات"
              subtitle="جديد المكتبة"
              movies={trending}
              accentColor={theme.primary}
              loading={isLoading}
              platformRef="netflix"
              onInfo={handleOpenInfo}
            />
          )}
        </div>
      </div>

      <NetflixFooter />

      <InfoModal
        visible={modalVisible}
        onClose={handleCloseInfo}
        movie={selectedMovie}
        accentColor={theme.primary}
        platformRef="netflix"
      />
    </div>
  );
}
