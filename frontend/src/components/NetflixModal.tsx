'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, ThumbsUp, Calendar, Clock, Film } from 'lucide-react';
import { getTMDBTrailer } from '@/lib/api';

interface NetflixModalProps {
  visible: boolean;
  onClose: () => void;
  movie: {
    tmdb_id?: string;
    title?: string;
    overview?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average?: number;
    release_date?: string;
    genre?: string;
    genres?: { id: number; name: string }[];
    runtime?: number;
    media_type?: string;
  } | null;
  accentColor?: string;
  platformRef?: string;
}

export default function NetflixModal({ visible, onClose, movie, accentColor = '#E50914', platformRef = 'netflix' }: NetflixModalProps) {
  const router = useRouter();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const tmdbId = movie?.tmdb_id;
  const mediaType = movie?.media_type || 'movie';
  const backdropUrl = movie?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null;
  const posterUrl = movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : null;
  const matchPercent = movie?.vote_average ? Math.round(movie.vote_average * 10) : 0;
  const year = movie?.release_date ? movie.release_date.slice(0, 4) : null;
  const genreNames = movie?.genres?.slice(0, 3).map(g => g.name).join(' • ') || movie?.genre || '';
  const runtime = movie?.runtime;

  useEffect(() => {
    if (!tmdbId || !visible) return;
    setTrailerLoading(true);
    setShowTrailer(false);
    getTMDBTrailer(tmdbId, mediaType as 'movie' | 'tv').then(key => {
      setTrailerKey(key);
      setTrailerLoading(false);
    }).catch(() => {
      setTrailerLoading(false);
    });
  }, [tmdbId, mediaType, visible]);

  useEffect(() => {
    if (!tmdbId) return;
    try {
      const favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      setIsFav(favs.some((f: any) => f.tmdb_id === tmdbId));
    } catch {}
  }, [tmdbId]);

  const toggleFav = useCallback(() => {
    if (!tmdbId || !movie) return;
    try {
      let favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      if (isFav) {
        favs = favs.filter((f: any) => f.tmdb_id !== tmdbId);
      } else {
        favs.push({
          tmdb_id: tmdbId,
          title: movie.title,
          poster: movie.poster_path,
          media_type: mediaType,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
          genres: movie.genres,
          overview: movie.overview,
        });
      }
      localStorage.setItem('osk_favorites', JSON.stringify(favs));
      setIsFav(!isFav);
    } catch {}
  }, [tmdbId, movie, isFav, mediaType]);

  const goToPlayer = useCallback(() => {
    if (!tmdbId) return;
    router.push(`/player?tmdb_id=${tmdbId}&type=${mediaType}${platformRef ? `&ref=${platformRef}` : ''}`);
    onClose();
  }, [tmdbId, mediaType, platformRef, router, onClose]);

  const handlePlayTrailer = useCallback(() => {
    if (trailerKey) setShowTrailer(true);
  }, [trailerKey]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTrailer) setShowTrailer(false);
        else onClose();
      }
    };
    if (visible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [visible, onClose, showTrailer]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {visible && movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8 sm:py-12 px-3 sm:px-6"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl bg-[#181818] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#181818]/80 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-[#282828] transition-colors group"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Backdrop / Trailer */}
            <div className="relative w-full aspect-video bg-black">
              {showTrailer && trailerKey ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur text-xs text-white hover:bg-black/90 transition flex items-center gap-1.5"
                  >
                    <X className="w-3 h-3" />
                    إغلاق التريلر
                  </button>
                </div>
              ) : backdropUrl ? (
                <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Film className="w-16 h-16 text-zinc-700" />
                </div>
              )}

              {/* Gradient overlay on backdrop */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />

              {/* Title on backdrop */}
              <div className="absolute bottom-4 left-5 sm:left-6 right-16 pointer-events-none">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-2xl leading-tight">
                  {movie.title}
                </h2>
              </div>

              {/* Trailer loading badge */}
              {trailerLoading && (
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 text-[10px] text-zinc-400 backdrop-blur-md">
                  جاري تحميل التريلر...
                </div>
              )}

              {/* Trailer play button */}
              {trailerKey && !showTrailer && (
                <button
                  onClick={handlePlayTrailer}
                  className="absolute inset-0 flex items-center justify-center z-20 group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/50 transition-all duration-300 group-hover:scale-110">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white ml-0.5" />
                  </div>
                </button>
              )}
            </div>

            {/* Content below backdrop */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Action buttons row */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={goToPlayer}
                  className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg font-bold text-sm text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-lg"
                  style={{ backgroundColor: accentColor, boxShadow: `0 4px 20px ${accentColor}50` }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                  شاهد الآن
                </button>
                <button
                  onClick={toggleFav}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                    isFav
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isFav ? 'rotate-45' : ''}`} />
                </button>
                <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 bg-white/5 border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95">
                  <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Meta info row */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                {matchPercent > 0 && (
                  <span className="text-emerald-400 font-bold">{matchPercent}% Match</span>
                )}
                {year && (
                  <span className="text-zinc-400">{year}</span>
                )}
                {runtime && (
                  <span className="text-zinc-400">
                    {Math.floor(runtime / 60)} س {runtime % 60} د
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 text-[9px] sm:text-[10px] font-medium">
                  HD
                </span>
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.slice(0, 5).map((g) => (
                    <span key={g.id} className="px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs bg-white/5 text-zinc-400 border border-white/5">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{movie.overview}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
