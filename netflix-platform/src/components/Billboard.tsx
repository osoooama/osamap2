"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ChevronDown, Play, Info } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBackdropUrl, getMatchPercent, getYear } from "@/lib/utils";
import type { TMDBMovie } from "@/lib/tmdb";

interface BillboardProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  onPlay?: (movie: TMDBMovie) => void;
  onInfo?: (movie: TMDBMovie) => void;
}

export default function Billboard({ movies, isLoading, onPlay, onInfo }: BillboardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featuredMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    return movies.slice(0, 5);
  }, [movies]);

  const featured = featuredMovies[currentIndex] || null;
  const backdropUrl = featured?.backdrop_path ? getBackdropUrl(featured.backdrop_path) : null;

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

  const matchPercent = featured ? getMatchPercent(featured.vote_average) : 0;
  const year = featured ? getYear(featured.release_date || featured.first_air_date) : null;
  const title = featured?.title || featured?.name || "Netflix";
  const overview = featured?.overview || "";

  if (isLoading) {
    return (
      <div className="relative h-[50vh] sm:h-[58vh] md:h-[65vh] lg:h-[70vh] bg-zinc-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
      </div>
    );
  }

  return (
    <div
      className="relative h-[50vh] sm:h-[58vh] md:h-[65vh] lg:h-[70vh] overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="sync">
        {backdropUrl && (
          <motion.div
            key={featured?.id}
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
            key={featured?.id}
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
                <Image src="/netflix-logo.svg" alt="Netflix" width={36} height={36} className="w-full h-full object-contain" />
              </div>
              <span className="text-red-500 text-[10px] sm:text-xs font-bold tracking-wider">NETFLIX</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] mb-2 drop-shadow-2xl"
            >
              {title}
            </motion.h1>

            {overview && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="text-zinc-300 text-[11px] sm:text-sm md:text-base max-w-lg line-clamp-2 leading-relaxed mb-3 drop-shadow-lg"
              >
                {overview}
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
              {year && <span className="text-zinc-400">{year}</span>}
              {featured?.media_type === "tv" && (
                <span className="text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">مسلسل</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
              className="flex items-center gap-3 mt-4"
            >
              <button
                onClick={() => onPlay?.(featured!)}
                className="flex items-center gap-2 px-5 sm:px-7 py-2 sm:py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all duration-200 text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                تشغيل
              </button>
              <button
                onClick={() => onInfo?.(featured!)}
                className="flex items-center gap-2 px-5 sm:px-7 py-2 sm:py-2.5 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-200 text-sm backdrop-blur-sm border border-white/10"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                معلومات أكثر
              </button>
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
              onClick={() => {
                setImageLoaded(false);
                setCurrentIndex(i);
              }}
              className={cn(
                "h-0.5 rounded-full transition-all duration-500",
                i === currentIndex ? "w-8 bg-white" : "w-4 bg-white/30 hover:bg-white/50"
              )}
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
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        </motion.div>
      </motion.div>
    </div>
  );
}
