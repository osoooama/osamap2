'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: any[];
  accentColor?: string;
  loading?: boolean;
}

export default function MovieRow({ title, subtitle, movies, accentColor = '#E50914', loading }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group/row mb-8">
      <div className="flex items-end gap-3 mb-5 px-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 sm:w-14 opacity-0 group-hover/row:opacity-100 transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/50 to-transparent hover:from-[#0a0a0a]"
          style={{ borderRight: 'none' }}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white/50 hover:text-white transition-colors" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px]">
                  <div className="aspect-[2/3] rounded-xl bg-zinc-900 animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-zinc-900 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-zinc-900 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            : movies.map((movie: any, i: number) => (
                <div key={movie.tmdb_id || movie._id || i} className="snap-start flex-shrink-0">
                  <MovieCard movie={movie} accentColor={accentColor} />
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 sm:w-14 opacity-0 group-hover/row:opacity-100 transition-all duration-300 flex items-center justify-center bg-gradient-to-l from-[#0a0a0a]/95 via-[#0a0a0a]/50 to-transparent hover:from-[#0a0a0a]"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/50 hover:text-white transition-colors" />
        </button>
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
