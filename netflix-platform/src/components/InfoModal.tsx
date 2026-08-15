"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Heart, Calendar, Clock, Star } from "lucide-react";
import { cn, getBackdropUrl, getPosterUrl, getMatchPercent, getYear, truncate } from "@/lib/utils";
import { getTrailer, GENRE_MAP } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";
import { useState, useCallback, useEffect } from "react";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  movie: TMDBMovie | null;
  accentColor?: string;
  onPlay?: (movie: TMDBMovie) => void;
}

export default function InfoModal({
  visible,
  onClose,
  movie,
  accentColor = "#E50914",
  onPlay,
}: InfoModalProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!visible || !movie) return;
    try {
      const favs = JSON.parse(localStorage.getItem("nf_favorites") || "[]");
      setIsFav(favs.some((f: TMDBMovie) => f.id === movie.id));
    } catch {}

    const loadTrailer = async () => {
      setTrailerLoading(true);
      const key = await getTrailer(movie.id, (movie.media_type as "movie" | "tv") || "movie");
      setTrailerKey(key);
      setTrailerLoading(false);
    };
    loadTrailer();
  }, [visible, movie]);

  const toggleFav = useCallback(() => {
    if (!movie) return;
    try {
      let favs = JSON.parse(localStorage.getItem("nf_favorites") || "[]");
      if (isFav) {
        favs = favs.filter((f: TMDBMovie) => f.id !== movie.id);
      } else {
        favs.push(movie);
      }
      localStorage.setItem("nf_favorites", JSON.stringify(favs));
      setIsFav(!isFav);
    } catch {}
  }, [isFav, movie]);

  if (!movie) return null;

  const title = movie.title || movie.name || "";
  const backdropUrl = movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : "";
  const posterUrl = movie.poster_path ? getPosterUrl(movie.poster_path) : "";
  const rating = getMatchPercent(movie.vote_average);
  const year = getYear(movie.release_date || movie.first_air_date);
  const genres = movie.genre_ids?.map((id) => GENRE_MAP[id]).filter(Boolean).slice(0, 4) || [];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-video">
              {trailerKey ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                  className="w-full h-full border-0"
                  allow="encrypted-media"
                  allowFullScreen
                />
              ) : backdropUrl ? (
                <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-600 text-4xl font-black">{title[0]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent pointer-events-none" />
            </div>

            <div className="p-6 -mt-20 relative z-10">
              <div className="flex items-start gap-4">
                {posterUrl && (
                  <div className="hidden sm:block w-20 lg:w-24 flex-shrink-0 rounded-lg overflow-hidden shadow-xl ring-1 ring-white/10">
                    <img src={posterUrl} alt={title} className="w-full h-auto" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2">{title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-3">
                    {rating > 0 && (
                      <span className="text-emerald-400 font-bold">{rating}% Match</span>
                    )}
                    {year && <span className="text-zinc-400">{year}</span>}
                    {movie.media_type === "tv" && (
                      <span className="text-zinc-400 bg-white/10 px-2 py-0.5 rounded border border-white/10">مسلسل</span>
                    )}
                    {movie.runtime && (
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {movie.runtime} دقيقة
                      </span>
                    )}
                  </div>
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {genres.map((g) => (
                        <span key={g} className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 text-[10px] sm:text-xs border border-white/5">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => onPlay?.(movie)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-black" />
                  تشغيل
                </button>
                <button
                  onClick={toggleFav}
                  className={cn(
                    "p-2.5 rounded-lg border transition-all",
                    isFav
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isFav && "fill-red-400")} />
                </button>
              </div>

              {movie.overview && (
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mt-4">
                  {movie.overview}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
