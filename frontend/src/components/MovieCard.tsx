'use client';

import { useRouter } from 'next/navigation';
import { Play, Star, Tv, Info, Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTMDBTrailer } from '@/lib/api';

interface MovieCardProps {
  movie: {
    tmdb_id?: string;
    title?: string;
    poster_path?: string;
    poster?: string;
    backdrop_path?: string;
    vote_average?: number;
    vote_count?: number;
    release_date?: string;
    overview?: string;
    genre?: string;
    genres?: { id: number; name: string }[];
    runtime?: number;
    category?: string;
    media_type?: string;
  };
  accentColor?: string;
  platformRef?: string;
  onInfo?: (movie: any) => void;
}

function getWatchProgress(tmdbId: string): number {
  try {
    const progress = JSON.parse(localStorage.getItem('osk_watch_progress') || '{}');
    return progress[tmdbId]?.progress || 0;
  } catch { return 0; }
}

export default function MovieCard({ movie, accentColor = '#E50914', platformRef, onInfo }: MovieCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useRef(false);

  const tmdbId = movie.tmdb_id;
  const title = movie.title || 'غير معروف';
  const mediaType = movie.media_type || 'movie';
  const posterUrl = movie.poster || movie.poster_path || '';
  const backdropUrl = movie.backdrop_path || '';
  const imgSrc = posterUrl.startsWith('http') ? posterUrl : posterUrl ? `https://image.tmdb.org/t/p/w500${posterUrl}` : '';
  const backdropSrc = backdropUrl ? `https://image.tmdb.org/t/p/w780${backdropUrl}` : imgSrc;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const genreNames = movie.genres?.slice(0, 2).map(g => g.name).join('، ') || movie.genre || '';
  const overview = movie.overview || '';

  useEffect(() => {
    isMobile.current = window.innerWidth < 768;
    return () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); };
  }, []);

  useEffect(() => {
    if (!tmdbId) return;
    try {
      const favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      setIsFav(favs.some((f: any) => f.tmdb_id === tmdbId));
    } catch {}
    setWatchProgress(getWatchProgress(tmdbId));
  }, [tmdbId]);

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tmdbId) return;
    try {
      let favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      if (isFav) {
        favs = favs.filter((f: any) => f.tmdb_id !== tmdbId);
      } else {
        favs.push({ tmdb_id: tmdbId, title, poster: posterUrl, media_type: mediaType, backdrop_path: backdropUrl, vote_average: movie.vote_average, release_date: movie.release_date, genres: movie.genres, overview });
      }
      localStorage.setItem('osk_favorites', JSON.stringify(favs));
      setIsFav(!isFav);
    } catch {}
  };

  const goToPlayer = () => {
    if (tmdbId) router.push(`/player?tmdb_id=${tmdbId}&type=${mediaType}${platformRef ? `&ref=${platformRef}` : ''}`);
  };
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPlayer();
  };

  const loadTrailer = async () => {
    if (trailerKey || trailerLoading || !tmdbId) return;
    setTrailerLoading(true);
    const key = await getTMDBTrailer(tmdbId, mediaType as 'movie' | 'tv');
    setTrailerKey(key);
    setTrailerLoading(false);
  };

  const handleMouseEnter = () => {
    if (isMobile.current) return;
    setIsHovered(true);
    hoverTimer.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const popupWidth = 300;
        const popupHeight = 340;
        const safeMargin = 16;
        const vh = window.innerHeight;

        let left = rect.left + rect.width / 2 - popupWidth / 2;
        if (left < safeMargin) left = safeMargin;
        if (left + popupWidth > window.innerWidth - safeMargin) left = window.innerWidth - popupWidth - safeMargin;

        const aboveTop = rect.top - 10;
        const belowTop = rect.bottom + 10;

        let titleBottom = 0;
        let el = cardRef.current.parentElement;
        while (el && el !== document.body) {
          const title = el.querySelector(':scope > div h2, :scope > h2') as HTMLElement | null;
          if (title) {
            titleBottom = title.getBoundingClientRect().bottom;
            break;
          }
          el = el.parentElement;
        }
        if (titleBottom === 0) {
          const allH2 = document.querySelectorAll('h2');
          for (const h of allH2) {
            const hBox = h.getBoundingClientRect();
            if (hBox.bottom > rect.top) continue;
            if (hBox.bottom > titleBottom) titleBottom = hBox.bottom;
          }
        }

        const canPlaceAbove = aboveTop >= safeMargin && (titleBottom === 0 || aboveTop - popupHeight >= titleBottom);
        const canPlaceBelow = belowTop + popupHeight <= vh - safeMargin;

        let top: number;
        if (canPlaceAbove) {
          top = aboveTop - popupHeight;
        } else if (canPlaceBelow) {
          top = belowTop;
        } else {
          top = vh - popupHeight - safeMargin;
        }

        setPopupPos({ top, left });
        setShowPopup(true);
        loadTrailer();
      }
    }, 350);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPopup(false);
  };

  const handleMobileTap = () => {
    if (isMobile.current) {
      goToPlayer();
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleMobileTap}
      className="relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px] lg:w-[200px] cursor-pointer z-0 hover:z-50 group"
    >
      <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-zinc-900 shadow-lg shadow-black/20 transition-all duration-500 group-hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.8)] group-hover:scale-[1.05] group-hover:-translate-y-1">
        {imgSrc && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-zinc-800 animate-pulse">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
            )}
            <img
              src={backdropSrc || imgSrc}
              alt={title}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-zinc-600 text-3xl sm:text-4xl font-black">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-800/80">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(watchProgress, 100)}%` }}
            />
          </div>
        )}

        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-3"
        >
          <div className="flex gap-1.5 mb-1.5">
            <button
              onClick={handlePlay}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl"
              style={{ backgroundColor: accentColor }}
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white ml-0.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onInfo?.(movie); }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
          {overview && (
            <p className="text-[9px] sm:text-[10px] text-zinc-300 line-clamp-2 leading-snug">{overview}</p>
          )}
        </motion.div>

        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black/70 backdrop-blur-md text-[10px] sm:text-xs border border-white/10">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-semibold">{rating}</span>
        </div>

        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex gap-1">
          {mediaType === 'tv' && (
            <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-blue-600/80 backdrop-blur-md text-[10px] sm:text-xs text-white font-semibold border border-white/10 flex items-center gap-0.5">
              <Tv className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              مسلسل
            </div>
          )}
        </div>
      </div>

      <div className="mt-1.5 sm:mt-2 px-0.5 space-y-0.5" dir="auto">
        <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-white truncate transition-colors mixed-text leading-tight" dir="auto">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-zinc-500 flex-wrap">
          {year && <span className="mixed-text" dir="auto">{year}</span>}
          {rating && (
            <span className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
              {rating}
            </span>
          )}
        </div>
        {genreNames && (
          <p className="text-[10px] sm:text-xs text-zinc-600 truncate mixed-text leading-tight" dir="auto">{genreNames}</p>
        )}
      </div>

      <AnimatePresence>
        {showPopup && backdropUrl && !isMobile.current && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ position: 'fixed', top: popupPos.top, left: popupPos.left, zIndex: 60 }}
            className="w-[280px] sm:w-[300px] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/70 border border-white/10 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => { setIsHovered(true); }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative aspect-video">
              {trailerKey ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&start=0`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <img src={backdropSrc} alt={title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2">
                <button onClick={handlePlay} className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-white/90 transition shadow-lg">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
                  تشغيل
                </button>
                <button onClick={toggleFav} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition ${isFav ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-red-400' : ''}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onInfo?.(movie); }} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border bg-white/10 border-white/20 text-white hover:bg-white/20 transition">
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              {trailerLoading && (
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-black/60 text-[9px] text-zinc-400">
                  جاري تحميل التريلر...
                </div>
              )}
            </div>
            <div className="p-2.5 sm:p-3 bg-zinc-900 space-y-1.5">
              <h4 className="text-white font-bold text-xs sm:text-sm leading-tight">{title}</h4>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-zinc-400">
                {year && <span>{year}</span>}
                {rating && (
                  <span className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
                    {rating}
                  </span>
                )}
                {genreNames && <span>{genreNames}</span>}
              </div>
              {overview && (
                <p className="text-[9px] sm:text-[10px] text-zinc-500 line-clamp-3 leading-snug">{overview}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
