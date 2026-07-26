'use client';

import { useRef, useState } from 'react';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: any[];
  accentColor?: string;
  loading?: boolean;
  platformRef?: string;
  onInfo?: (movie: any) => void;
  showSeeAll?: boolean;
}

export default function MovieRow({ title, subtitle, movies, accentColor = '#E50914', loading, platformRef, onInfo, showSeeAll = true }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStart.current = { x: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStart.current.x) * 1.5;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    dragStart.current = { x: e.touches[0].pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStart.current.x) * 1.5;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - walk;
  };

  return (
    <div className="relative mb-5 sm:mb-8 group/row">
      <div className="flex items-end gap-2 sm:gap-3 mb-3 sm:mb-5 px-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full" style={{ backgroundColor: accentColor }} />
          <div>
            <h2 className="text-sm sm:text-lg md:text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {showSeeAll && !loading && movies.length > 0 && (
          <button className="text-zinc-500 hover:text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 mr-auto">
            عرض الكل
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-2 sm:left-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-r-lg"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 sm:right-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-l-lg"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onScroll={checkScroll}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px] lg:w-[200px] pointer-events-none">
                  <div className="aspect-[2/3] rounded-xl bg-zinc-900 animate-pulse overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="mt-2 space-y-1.5 px-0.5">
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-zinc-800 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            : movies.map((movie: any, i: number) => (
                <div key={movie.tmdb_id || movie._id || i} className="flex-shrink-0 pointer-events-auto">
                  <MovieCard movie={movie} accentColor={accentColor} platformRef={platformRef} onInfo={onInfo} />
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
