"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TMDBMovie } from "@/lib/tmdb";
import Card from "./Card";

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: TMDBMovie[];
  loading?: boolean;
  onInfo?: (movie: TMDBMovie) => void;
  onPlay?: (movie: TMDBMovie) => void;
}

export default function MovieRow({
  title,
  subtitle,
  movies,
  loading,
  onInfo,
  onPlay,
}: MovieRowProps) {
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
    <div className="relative mb-5 sm:mb-8 group/row" dir="rtl">
      <div className="flex items-end gap-2 sm:gap-3 mb-3 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full bg-[#C9A96E]" />
          <div>
            <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {movies.length > 0 && (
          <button className="text-zinc-500 hover:text-[#C9A96E] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 mr-auto">
            عرض الكل
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-l from-white/5 to-transparent" />
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            aria-label="التمرير لليمين"
            onClick={() => scroll("left")}
            className="absolute right-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-l from-[#060F0A] via-[#060F0A]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-l-lg"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        )}
        {canScrollRight && (
          <button
            aria-label="التمرير لليسار"
            onClick={() => scroll("right")}
            className="absolute left-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-r from-[#060F0A] via-[#060F0A]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-r-lg"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-3 px-4 select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={checkScroll}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px] lg:w-[200px] pointer-events-none"
                >
                  <div className="aspect-[2/3] rounded-xl bg-[#0D3320] animate-pulse overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="mt-2 space-y-1.5 px-0.5">
                    <div className="h-3 bg-[#0D3320] rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-[#0D3320] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            : movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 pointer-events-auto">
                  <Card movie={movie} onInfo={onInfo} onPlay={onPlay} />
                </div>
              ))}
        </div>
      </div>

      {!loading && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">لا توجد عناصر متاحة حالياً</p>
          <p className="text-zinc-700 text-xs mt-1">سيتم إضافة المحتوى قريباً</p>
        </div>
      )}
    </div>
  );
}
