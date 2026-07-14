'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, ThumbsUp, Star, Calendar, Clock, Film } from 'lucide-react';
import { getTMDBTrailer } from '@/lib/api';

interface InfoModalProps {
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

export default function InfoModal({ visible, onClose, movie, accentColor = '#E50914', platformRef = 'netflix' }: InfoModalProps) {
  const router = useRouter();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const tmdbId = movie?.tmdb_id;
  const mediaType = movie?.media_type || 'movie';
  const backdropUrl = movie?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null;
  const posterUrl = movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie?.release_date ? movie.release_date.slice(0, 4) : null;
  const genreNames = movie?.genres?.slice(0, 3).map(g => g.name).join(' • ') || movie?.genre || '';
  const runtime = movie?.runtime;

  useEffect(() => {
    if (!tmdbId || !visible) return;
    setTrailerLoading(true);
    getTMDBTrailer(tmdbId, mediaType as 'movie' | 'tv').then(key => {
      setTrailerKey(key);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (visible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [visible, onClose]);

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
          transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-10 px-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5"
          >
            {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-zinc-800/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

            {/* Backdrop / Trailer */}
            <div className="relative w-full aspect-video">
              {trailerKey ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : backdropUrl ? (
                <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Film className="w-16 h-16 text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

              {/* Title overlay on image */}
              {!trailerKey && (
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{movie.title}</h2>
                </div>
              )}

              {trailerLoading && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 text-xs text-zinc-400 backdrop-blur-md">
                  جاري تحميل التريلر...
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={goToPlayer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
                  style={{ backgroundColor: accentColor, boxShadow: `0 8px 24px ${accentColor}40` }}
                >
                  <Play className="w-4 h-4 fill-white" />
                  تشغيل
                </button>
                <button
                  onClick={toggleFav}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isFav
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className={`w-5 h-5 transition-transform ${isFav ? 'rotate-45' : ''}`} />
                </button>
                <button className="w-10 h-10 rounded-full border-2 bg-white/5 border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95">
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {rating && (
                  <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-lg border border-yellow-400/20">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {rating}
                  </span>
                )}
                {year && (
                  <span className="flex items-center gap-1 text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Calendar className="w-3 h-3" />
                    {year}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1 text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Clock className="w-3 h-3" />
                    {Math.floor(runtime / 60)} س {runtime % 60} د
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-zinc-400 border border-white/5 font-medium">
                  جودة عالية
                </span>
              </div>

              {/* Genres */}
              {genreNames && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres?.slice(0, 4).map((g) => (
                    <span key={g.id} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-white/5">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">القصة</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{movie.overview}</p>
                </div>
              )}

              {/* Trailer section */}
              {trailerKey && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Play className="w-3 h-3" style={{ color: accentColor }} />
                    مشاهدة التريلر
                  </h3>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800 border border-white/5">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
