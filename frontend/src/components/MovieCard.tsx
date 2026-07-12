'use client';

import { useRouter } from 'next/navigation';
import { Play, Star, Tv, Info, Heart, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export default function MovieCard({ movie, accentColor = '#E50914', platformRef }: MovieCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const tmdbId = movie.tmdb_id;
  const title = movie.title || 'Unknown';
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
    return () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); };
  }, []);

  useEffect(() => {
    if (!tmdbId) return;
    try {
      const favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      setIsFav(favs.some((f: any) => f.tmdb_id === tmdbId));
    } catch {}
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

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimer.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const popupWidth = 300;
        let left = rect.left + rect.width / 2 - popupWidth / 2;
        if (left < 8) left = 8;
        if (left + popupWidth > window.innerWidth - 8) left = window.innerWidth - popupWidth - 8;
        setPopupPos({ top: rect.top - 10, left });
        setShowPopup(true);
      }
    }, 800);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPopup(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={goToPlayer}
      className="relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] cursor-pointer z-0 hover:z-50"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shadow-lg shadow-black/20 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/50 group-hover:scale-[1.02]">
        {imgSrc && !imgError ? (
          <img
            src={backdropSrc || imgSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-zinc-600 text-5xl font-black">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col justify-end p-4"
        >
          <div className="flex gap-2 mb-2">
            <button
              onClick={handlePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl"
              style={{ backgroundColor: accentColor }}
            >
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToPlayer(); }}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Info className="w-4 h-4 text-white" />
            </button>
          </div>
          {overview && (
            <p className="text-[10px] text-zinc-300 line-clamp-2 leading-relaxed">{overview}</p>
          )}
        </motion.div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs border border-white/10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-semibold">{rating}</span>
        </div>

        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {mediaType === 'tv' && (
            <div className="px-2 py-1 rounded-lg bg-blue-600/80 backdrop-blur-md text-xs text-white font-semibold border border-white/10 flex items-center gap-1">
              <Tv className="w-3 h-3" />
              مسلسل
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 px-0.5 space-y-1" dir="auto">
        <h3 className="text-sm font-semibold text-white truncate transition-colors mixed-text" dir="auto">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
          {year && <span className="mixed-text" dir="auto">{year}</span>}
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {rating}
            </span>
          )}
        </div>
        {genreNames && (
          <p className="text-xs text-zinc-600 truncate mixed-text" dir="auto">{genreNames}</p>
        )}
      </div>

      <AnimatePresence>
        {showPopup && backdropUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ position: 'fixed', top: popupPos.top, left: popupPos.left, zIndex: 9999 }}
            className="w-[300px] rounded-2xl overflow-hidden shadow-2xl shadow-black/70 border border-white/10 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <img src={backdropSrc} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                <button onClick={handlePlay} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition shadow-lg">
                  <Play className="w-4 h-4 fill-black" />
                  تشغيل
                </button>
                <button onClick={toggleFav} className={`p-2 rounded-xl border transition ${isFav ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-red-400' : ''}`} />
                </button>
              </div>
            </div>
            <div className="p-3 bg-zinc-900 space-y-2">
              <h4 className="text-white font-bold text-sm">{title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                {year && <span>{year}</span>}
                {rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {rating}
                  </span>
                )}
                {genreNames && <span>{genreNames}</span>}
              </div>
              {overview && (
                <p className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed">{overview}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
