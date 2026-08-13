'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import Top10Row from '@/components/Top10Row';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import SiteFooter from '@/components/NetflixFooter';
import NetflixModal from '@/components/NetflixModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const theme = { primary: '#E50914' };

const GENRE_MAP: Record<string, number[]> = {
  all: [],
  action: [28, 12],
  comedy: [35],
  drama: [18],
  horror: [27],
  scifi: [878],
  romance: [10749],
  adventure: [12, 14],
  thriller: [53, 80],
  family: [10751, 16],
  documentary: [99],
};

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
  { label: 'عائلي', value: 'family' },
  { label: 'وثائقي', value: 'documentary' },
];

function filterByGenre(movies: any[], genre: string): any[] {
  if (genre === 'all') return movies;
  const ids = GENRE_MAP[genre] || [];
  if (ids.length === 0) return movies;
  return movies.filter((m) => {
    const movieIds = m.genre_ids || m.genres?.map((g: any) => g.id) || [];
    return ids.some((id) => movieIds.includes(id));
  });
}

function getMatchPercent(movie: any): number {
  if (!movie?.vote_average) return 0;
  return Math.round(movie.vote_average * 10);
}

function Billboard({ movies, isLoading }: { movies: any[]; isLoading: boolean }) {
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

  const matchPercent = getMatchPercent(featured);

  return (
    <div
      className="relative h-[50vh] sm:h-[58vh] md:h-[65vh] lg:h-[70vh] overflow-hidden bg-black"
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

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/20" />
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

      <div className="absolute bottom-[20%] sm:bottom-[25%] md:bottom-[28%] left-0 right-0 px-4 sm:px-8 md:px-14 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured?.tmdb_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex items-center gap-2 mb-2 sm:mb-3"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg overflow-hidden ring-1 ring-red-500/30 shadow-lg shadow-red-500/20">
                <Image src="/netflix.webp" alt="Netflix" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <span className="text-red-500 text-[10px] sm:text-xs font-bold tracking-wider">NETFLIX</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] mb-2 drop-shadow-2xl"
            >
              {featured?.title || 'Netflix'}
            </motion.h1>

            {featured?.overview && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="text-zinc-300 text-[11px] sm:text-sm md:text-base max-w-lg line-clamp-2 leading-relaxed mb-3 drop-shadow-lg"
              >
                {featured.overview}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs"
            >
              {matchPercent > 0 && (
                <span className="text-emerald-400 font-bold">{matchPercent}% Match</span>
              )}
              {featured?.release_date && (
                <span className="text-zinc-400">{featured.release_date.slice(0, 4)}</span>
              )}
              {featured?.media_type === 'tv' && (
                <span className="text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">مسلسل</span>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-[20%] sm:bottom-[25%] md:bottom-[28%] right-4 sm:right-8 md:right-14 lg:right-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 transition-all duration-300 bg-black/30 backdrop-blur-sm hover:bg-black/50"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      {featuredMovies.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
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
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
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

  const filteredMovies = useMemo(() => filterByGenre(movies || [], selectedGenre), [movies, selectedGenre]);
  const filteredTv = useMemo(() => filterByGenre(tvShows || [], selectedGenre), [tvShows, selectedGenre]);
  const filteredTrending = useMemo(() => filterByGenre(trending || [], selectedGenre), [trending, selectedGenre]);
  const filteredTopRated = useMemo(() => filterByGenre(topRated || [], selectedGenre), [topRated, selectedGenre]);
  const filteredAction = useMemo(() => filterByGenre(actionMovies || [], selectedGenre), [actionMovies, selectedGenre]);

  const top10Movies = useMemo(() => {
    const source = [...filteredMovies].sort((a, b) => (b?.vote_average || 0) - (a?.vote_average || 0));
    return source.slice(0, 10);
  }, [filteredMovies]);

  const isFiltered = selectedGenre !== 'all';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Billboard movies={movies || []} isLoading={isLoading} />

      <div className="relative z-10 -mt-10 sm:-mt-14 md:-mt-20">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-5 sm:space-y-8">
          <GenrePills selected={selectedGenre} onSelect={setSelectedGenre} />

          {!isFiltered && <ContinueWatchingRow onInfo={handleOpenInfo} />}

          {!isFiltered && top10Movies.length > 0 && (
            <Top10Row
              title="Top 10 اليوم"
              subtitle="الأكثر مشاهدة في مصر"
              movies={top10Movies}
              accentColor={theme.primary}
              onInfo={handleOpenInfo}
            />
          )}

          {filteredMovies.length > 0 && (
            <MovieRow
              title={isFiltered ? `أفلام ${GENRES.find(g => g.value === selectedGenre)?.label || ''}` : 'أفلام عالمية'}
              subtitle={isFiltered ? 'نتائج التصفية' : 'الأكثر مشاهدة هذا الأسبوع'}
              movies={filteredMovies}
              accentColor={theme.primary}
              loading={isLoading}
              platformRef="netflix"
              onInfo={handleOpenInfo}
            />
          )}

          {filteredTv.length > 0 && (
            <MovieRow
              title={isFiltered ? `مسلسلات ${GENRES.find(g => g.value === selectedGenre)?.label || ''}` : 'مسلسلات عالمية'}
              subtitle={isFiltered ? 'نتائج التصفية' : 'أشهر المسلسلات العالمية'}
              movies={filteredTv}
              accentColor={theme.primary}
              loading={tvLoading}
              platformRef="netflix"
              onInfo={handleOpenInfo}
            />
          )}

          {filteredTopRated.length > 0 && (
            <MovieRow
              title="الأكثر تقييماً"
              subtitle="أفضل الأفلام العالمية"
              movies={filteredTopRated}
              accentColor={theme.primary}
              loading={isLoading}
              platformRef="netflix"
              onInfo={handleOpenInfo}
            />
          )}

          {filteredAction.length > 0 && (
            <MovieRow
              title="أكشن ومغامرة"
              subtitle="لمحبي الأكشن"
              movies={filteredAction}
              accentColor={theme.primary}
              loading={isLoading}
              platformRef="netflix"
              onInfo={handleOpenInfo}
            />
          )}

          {filteredTrending.length > 0 && (
            <MovieRow
              title="أحدث الإضافات"
              subtitle="جديد المكتبة"
              movies={filteredTrending}
              accentColor={theme.primary}
              loading={isLoading}
              platformRef="netflix"
              onInfo={handleOpenInfo}
            />
          )}

          {!isLoading && filteredMovies.length === 0 && filteredTv.length === 0 && isFiltered && (
            <div className="text-center py-16">
              <p className="text-zinc-500 text-sm">لا توجد نتائج لهذا التصنيف</p>
              <p className="text-zinc-600 text-xs mt-1">جرّب تصنيفاً آخر</p>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />

      <NetflixModal
        visible={modalVisible}
        onClose={handleCloseInfo}
        movie={selectedMovie}
        accentColor={theme.primary}
        platformRef="netflix"
      />
    </div>
  );
}
