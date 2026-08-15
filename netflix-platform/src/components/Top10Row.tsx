"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getPosterUrl, getMatchPercent, getYear } from "@/lib/utils";
import type { TMDBMovie } from "@/lib/tmdb";

interface Top10RowProps {
  title: string;
  subtitle?: string;
  movies: TMDBMovie[];
  accentColor?: string;
  onInfo?: (movie: TMDBMovie) => void;
}

export default function Top10Row({
  title,
  subtitle,
  movies,
  accentColor = "#E50914",
  onInfo,
}: Top10RowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  const scroll = useCallback(
    (dir: "left" | "right") => {
      if (!scrollRef.current) return;
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -amount : amount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 400);
    },
    [checkScroll]
  );

  return (
    <div className="relative mb-5 sm:mb-8 group/row">
      <div className="flex items-end gap-2 sm:gap-3 mb-3 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div>
            <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 sm:left-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-r-lg"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 sm:right-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-l-lg"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={checkScroll}
        >
          {movies.map((movie, index) => {
            const posterUrl = movie.poster_path ? getPosterUrl(movie.poster_path) : "";
            const rating = getMatchPercent(movie.vote_average);
            const year = getYear(movie.release_date || movie.first_air_date);
            const rank = index + 1;

            return (
              <div
                key={movie.id}
                className="flex-shrink-0 flex items-end gap-0 cursor-pointer group/card"
                onClick={() => onInfo?.(movie)}
              >
                <span
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none mr-[-10px] sm:mr-[-15px] z-10 drop-shadow-2xl"
                  style={{
                    WebkitTextStroke: "2px rgba(255,255,255,0.3)",
                    color: "transparent",
                  }}
                >
                  {rank}
                </span>
                <div className="relative w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-2xl">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title || movie.name || ""}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                      <span className="text-zinc-600 text-2xl font-black">{rank}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-[10px] sm:text-xs font-bold line-clamp-1">
                      {movie.title || movie.name}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px]">
                      {rating > 0 && (
                        <span className="text-emerald-400 font-semibold">{rating}%</span>
                      )}
                      {year && <span className="text-zinc-400">{year}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
