'use client';

import { useMovies } from '@/hooks/useMovies';
import DisneyRow from '@/components/DisneyRow';
import SiteFooter from '@/components/NetflixFooter';
import NetflixModal from '@/components/NetflixModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ChevronDown, Plus, Check, Play, Info } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const theme = { primary: '#0063E5' };

const BRANDS = [
  { id: 'disney', label: 'Disney', color: '#0063E5', genres: [16, 10751] },
  { id: 'pixar', label: 'Pixar', color: '#6BCB77', genres: [16, 10751] },
  { id: 'marvel', label: 'Marvel', color: '#E23636', genres: [28, 878, 12] },
  { id: 'starwars', label: 'Star Wars', color: '#FFE818', genres: [878, 12] },
  { id: 'natgeo', label: 'National Geographic', color: '#FFCC00', genres: [99] },
];

function getGenreNames(ids: number[]): string {
  const map: Record<number, string> = { 28: 'أكشن', 12: 'مغامرة', 16: 'أنيميشن', 35: 'كوميدي', 80: 'جريمة', 18: 'دراما', 10751: 'عائلي', 878: 'خيال علمي', 99: 'وثائقي', 27: 'رعب', 53: 'إثارة', 10749: 'رومانسي' };
  return ids.map(id => map[id]).filter(Boolean).slice(0, 3).join(' • ');
}

function getBadge(movie: any): string | null {
  const year = movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0;
  const thisYear = new Date().getFullYear();
  if (year === thisYear) return 'جديد';
  if (year === thisYear - 1 && movie.vote_average >= 7) return 'حصري';
  return null;
}

function BrandRow({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border-2 ${
          !selected
            ? 'bg-white text-black border-white shadow-lg shadow-white/20'
            : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/40 hover:text-white'
        }`}
      >
        الكل
      </button>
      {BRANDS.map(b => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id === selected ? null : b.id)}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border-2 ${
            selected === b.id
              ? 'text-white border-current shadow-lg'
              : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/40 hover:text-white'
          }`}
          style={selected === b.id ? { backgroundColor: b.color + '30', borderColor: b.color, color: b.color, boxShadow: `0 4px 20px ${b.color}30` } : {}}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

function HeroBanner({ movies, isLoading, onInfo, onPlay }: { movies: any[]; isLoading: boolean; onInfo: (m: any) => void; onPlay: (m: any) => void }) {
  const [current, setCurrent] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const featured = movies?.[current % (movies?.length || 1)] || null;
  const backdropUrl = featured?.backdrop_path ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}` : null;
  const matchPct = featured?.vote_average ? Math.round(featured.vote_average * 10) : 0;

  useEffect(() => {
    if (!movies || movies.length <= 1 || isPaused) return;
    intervalRef.current = setInterval(() => {
      setImageLoaded(false);
      setCurrent(c => (c + 1) % movies.length);
    }, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [movies?.length, isPaused]);

  useEffect(() => { setImageLoaded(false); }, [current]);

  return (
    <div
      className="relative h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[80vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="sync">
        {backdropUrl && (
          <motion.div
            key={featured?.tmdb_id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 1.08 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <img src={backdropUrl} alt="" onLoad={() => setImageLoaded(true)} className="w-full h-full object-cover" style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/20" />
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

      <div className="absolute bottom-[18%] sm:bottom-[22%] md:bottom-[25%] left-0 right-0 px-4 sm:px-8 md:px-14 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured?.tmdb_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-[#0063E5] to-[#003399] flex items-center justify-center">
                <span className="text-white font-black text-xs sm:text-sm">D+</span>
              </div>
              <span className="text-[#0063E5] text-[10px] sm:text-xs font-black tracking-wider">DISNEY+</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.9] mb-3 drop-shadow-2xl"
            >
              {featured?.title || 'Disney+'}
            </motion.h1>

            {featured?.overview && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-zinc-300 text-[11px] sm:text-sm md:text-base max-w-lg line-clamp-2 leading-relaxed mb-4 drop-shadow-lg">
                {featured.overview}
              </motion.p>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs mb-4">
              {matchPct > 0 && <span className="text-emerald-400 font-bold">{matchPct}% Match</span>}
              {featured?.release_date && <span className="text-zinc-400">{featured.release_date.slice(0, 4)}</span>}
              {featured?.genre_ids && <span className="text-zinc-500">{getGenreNames(featured.genre_ids)}</span>}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => featured && onPlay(featured)}
                className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#0063E5] hover:bg-[#0B84FF] text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-[#0063E5]/30 hover:shadow-[#0063E5]/50"
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
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-[18%] sm:bottom-[22%] md:bottom-[25%] right-4 sm:right-8 md:right-14 lg:right-20">
        <button onClick={() => setMuted(!muted)} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 transition-all bg-black/30 backdrop-blur-sm hover:bg-black/50">
          {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      {movies && movies.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
          {movies.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => { setImageLoaded(false); setCurrent(i); }}
              className={`h-0.5 rounded-full transition-all duration-500 ${i === (current % movies.length) ? 'w-8 bg-[#0063E5]' : 'w-4 bg-white/30 hover:bg-white/50'}`}
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

export default function DisneyPage() {
  const { data: animationMovies, isLoading: moviesLoading } = useMovies('animation', 1, 'movie');
  const { data: animationMovies2, isLoading: movies2Loading } = useMovies('animation', 2, 'movie');
  const { data: animationMovies3, isLoading: movies3Loading } = useMovies('animation', 3, 'movie');
  const { data: animationTv, isLoading: tvLoading } = useMovies('animation', 1, 'tv');
  const { data: animationTv2, isLoading: tv2Loading } = useMovies('animation', 2, 'tv');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const handleOpenInfo = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setModalVisible(false);
    setSelectedMovie(null);
  }, []);

  const handlePlay = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  }, []);

  const allAnimation = useMemo(() => {
    const all = [...(animationMovies || []), ...(animationMovies2 || []), ...(animationMovies3 || []), ...(animationTv || []), ...(animationTv2 || [])];
    const unique = Array.from(new Map(all.map(m => [m.tmdb_id || m.id, m])).values());
    if (!selectedBrand) return unique;
    const brand = BRANDS.find(b => b.id === selectedBrand);
    if (!brand) return unique;
    return unique.filter(m => {
      const ids = m.genre_ids || m.genres?.map((g: any) => g.id) || [];
      return brand.genres.some(gid => ids.includes(gid));
    });
  }, [animationMovies, animationMovies2, animationMovies3, animationTv, animationTv2, selectedBrand]);

  const top10 = useMemo(() => {
    return [...allAnimation].sort((a, b) => (b?.vote_average || 0) - (a?.vote_average || 0)).slice(0, 10);
  }, [allAnimation]);

  const disneyPixar = useMemo(() => {
    return allAnimation.filter(m => {
      const ids = m.genre_ids || m.genres?.map((g: any) => g.id) || [];
      return ids.includes(16) && ids.includes(10751);
    });
  }, [allAnimation]);

  const marvelStarWars = useMemo(() => {
    return allAnimation.filter(m => {
      const ids = m.genre_ids || m.genres?.map((g: any) => g.id) || [];
      return ids.includes(28) || ids.includes(878);
    });
  }, [allAnimation]);

  const familyKids = useMemo(() => {
    return allAnimation.filter(m => {
      const ids = m.genre_ids || m.genres?.map((g: any) => g.id) || [];
      return ids.includes(10751) && !ids.includes(16);
    });
  }, [allAnimation]);

  const documentaries = useMemo(() => {
    return allAnimation.filter(m => {
      const ids = m.genre_ids || m.genres?.map((g: any) => g.id) || [];
      return ids.includes(99);
    });
  }, [allAnimation]);

  const isFiltered = selectedBrand !== null;
  const brandName = selectedBrand ? BRANDS.find(b => b.id === selectedBrand)?.label : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <HeroBanner movies={allAnimation || []} isLoading={moviesLoading} onInfo={handleOpenInfo} onPlay={handlePlay} />

      <div className="relative z-10 -mt-12 sm:-mt-16 md:-mt-20">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-5 sm:space-y-8">
          <BrandRow selected={selectedBrand} onSelect={setSelectedBrand} />

          {isFiltered ? (
            <DisneyRow
              title={`${brandName}`}
              subtitle={`كل محتوى ${brandName}`}
              movies={allAnimation}
              loading={moviesLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          ) : (
            <>
              <DisneyRow
                title="ديزني وبكسلر"
                subtitle="أفلام الأنيميشن العائلية"
                movies={disneyPixar}
                loading={moviesLoading}
                onInfo={handleOpenInfo}
                onPlay={handlePlay}
              />

              <DisneyRow
                title="مارفل وستار وورز"
                subtitle="أكشن ومغامرة وخيال علمي"
                movies={marvelStarWars}
                loading={moviesLoading}
                onInfo={handleOpenInfo}
                onPlay={handlePlay}
              />

              <DisneyRow
                title="مسلسلات أنيميشن"
                subtitle="مسلسلات كرتونية مميزة"
                movies={[...(animationTv || []), ...(animationTv2 || [])]}
                loading={tvLoading}
                onInfo={handleOpenInfo}
                onPlay={handlePlay}
              />

              <DisneyRow
                title="عائلي وأطفال"
                subtitle="للعائلات والأطفال"
                movies={familyKids}
                loading={moviesLoading}
                onInfo={handleOpenInfo}
                onPlay={handlePlay}
              />

              <DisneyRow
                title="ناشونال جيوغرافيك"
                subtitle="وثائقيات مذهلة"
                movies={documentaries}
                loading={moviesLoading}
                onInfo={handleOpenInfo}
                onPlay={handlePlay}
              />

              <DisneyRow
                title="الأكثر تقييماً"
                subtitle="أفضل أفلام الأنيميشن"
                movies={top10}
                loading={moviesLoading}
                onInfo={handleOpenInfo}
                onPlay={handlePlay}
              />
            </>
          )}
        </div>
      </div>

      <SiteFooter />

      <NetflixModal
        visible={modalVisible}
        onClose={handleCloseInfo}
        movie={selectedMovie}
        accentColor={theme.primary}
        platformRef="disney"
      />
    </div>
  );
}
