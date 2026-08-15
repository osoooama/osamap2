"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Heart, Tv } from "lucide-react";
import { cn, getPosterUrl, getBackdropUrl, getMatchPercent, getYear, truncate } from "@/lib/utils";
import { getTrailer, DISNEY_GENRES } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
  onInfo?: (movie: TMDBMovie) => void;
  onPlay?: (movie: TMDBMovie) => void;
}

export default function MovieCard({ movie, onInfo, onPlay }: MovieCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useRef(false);

  const title = movie.title || movie.name || "غير معروف";
  const posterUrl = movie.poster_path ? getPosterUrl(movie.poster_path) : "";
  const backdropUrl = movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : posterUrl;
  const rating = getMatchPercent(movie.vote_average);
  const year = getYear(movie.release_date || movie.first_air_date);
  const genreNames = movie.genre_ids?.slice(0, 2).map((id) => DISNEY_GENRES[id]).filter(Boolean).join("، ") || "";
  const mediaType = movie.media_type || "movie";

  useEffect(() => {
    isMobile.current = window.innerWidth < 768;
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("dis_favorites") || "[]");
      setIsFav(favs.some((f: TMDBMovie) => f.id === movie.id));
    } catch {}
  }, [movie.id]);

  const toggleFav = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        let favs = JSON.parse(localStorage.getItem("dis_favorites") || "[]");
        if (isFav) {
          favs = favs.filter((f: TMDBMovie) => f.id !== movie.id);
        } else {
          favs.push(movie);
        }
        localStorage.setItem("dis_favorites", JSON.stringify(favs));
        setIsFav(!isFav);
      } catch {}
    },
    [isFav, movie]
  );

  const loadTrailer = useCallback(async () => {
    if (trailerKey || trailerLoading) return;
    setTrailerLoading(true);
    const key = await getTrailer(movie.id, mediaType as "movie" | "tv");
    setTrailerKey(key);
    setTrailerLoading(false);
  }, [movie.id, mediaType, trailerKey, trailerLoading]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile.current) return;
    setIsHovered(true);
    hoverTimer.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const popupWidth = 300;
        const safeMargin = 16;
        const vh = window.innerHeight;

        let left = rect.left + rect.width / 2 - popupWidth / 2;
        if (left < safeMargin) left = safeMargin;
        if (left + popupWidth > window.innerWidth - safeMargin)
          left = window.innerWidth - popupWidth - safeMargin;

        const aboveTop = rect.top - 10;
        const belowTop = rect.bottom + 10;
        const popupHeight = 340;

        const canPlaceAbove = aboveTop >= popupHeight + safeMargin;
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
  }, [loadTrailer]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPopup(false);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px] lg:w-[200px] cursor-pointer z-0 hover:z-50 group"
      dir="rtl"
    >
      <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#16163A] shadow-lg shadow-black/20 transition-all duration-500 group-hover:shadow-[0_8px_40px_-8px_rgba(0,99,229,0.3)] group-hover:scale-[1.05] group-hover:-translate-y-1">
        {posterUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-[#16163A] animate-pulse">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
            )}
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
              className={cn(
                "w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#16163A] to-[#0C111B]">
            <span className="text-[#0063E5]/30 text-3xl sm:text-4xl font-black">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0C111B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-3"
        >
          <div className="flex gap-1.5 mb-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(movie);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl bg-[#0063E5]"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white mr-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfo?.(movie);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
          {movie.overview && (
            <p className="text-[9px] sm:text-[10px] text-zinc-300 line-clamp-2 leading-snug">
              {truncate(movie.overview, 80)}
            </p>
          )}
        </motion.div>

        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black/70 backdrop-blur-md text-[10px] sm:text-xs border border-white/10">
          <span className="text-[#0063E5] font-bold">{rating}%</span>
        </div>

        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex gap-1">
          {mediaType === "tv" && (
            <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-[#1F1F4B]/80 backdrop-blur-md text-[10px] sm:text-xs text-[#0063E5] font-semibold border border-[#0063E5]/20 flex items-center gap-0.5">
              <Tv className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              مسلسل
            </div>
          )}
        </div>
      </div>

      <div className="mt-1.5 sm:mt-2 px-0.5 space-y-0.5" dir="auto">
        <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-white truncate leading-tight" dir="auto">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-zinc-500 flex-wrap">
          {year && <span dir="auto">{year}</span>}
          {rating > 0 && (
            <span className="flex items-center gap-0.5 text-[#0063E5] font-semibold">{rating}%</span>
          )}
        </div>
        {genreNames && (
          <p className="text-[10px] sm:text-xs text-zinc-600 truncate leading-tight" dir="auto">{genreNames}</p>
        )}
      </div>

      <AnimatePresence>
        {showPopup && !isMobile.current && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -5 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ position: "fixed", top: popupPos.top, left: popupPos.left, zIndex: 60 }}
            className="w-[280px] sm:w-[300px] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/70 border border-[#0063E5]/10 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            dir="rtl"
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
                <img src={backdropUrl || posterUrl} alt={title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C111B]/90 via-[#0C111B]/30 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay?.(movie);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-[#0063E5] text-white font-bold text-xs sm:text-sm hover:bg-[#0052CC] transition shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                  مشاهدة
                </button>
                <button
                  onClick={toggleFav}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition",
                    isFav
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isFav && "fill-red-400")} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInfo?.(movie);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border bg-white/10 border-white/20 text-white hover:bg-white/20 transition"
                >
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              {trailerLoading && (
                <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md bg-black/60 text-[9px] text-zinc-400">
                  جاري تحميل التريلر...
                </div>
              )}
            </div>
            <div className="p-2.5 sm:p-3 bg-[#0C111B] space-y-1.5">
              <h4 className="text-white font-bold text-xs sm:text-sm leading-tight">{title}</h4>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-zinc-400">
                {year && <span>{year}</span>}
                {rating > 0 && (
                  <span className="flex items-center gap-0.5 text-[#0063E5] font-semibold">
                    {rating}% توافق
                  </span>
                )}
                {genreNames && <span>{genreNames}</span>}
              </div>
              {movie.overview && (
                <p className="text-[9px] sm:text-[10px] text-zinc-500 line-clamp-3 leading-snug">
                  {truncate(movie.overview, 120)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
