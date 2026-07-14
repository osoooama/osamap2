'use client';

import { useRef, useState } from 'react';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: any[];
  accentColor?: string;
  loading?: boolean;
  platformRef?: string;
  onInfo?: (movie: any) => void;
}

export default function MovieRow({ title, subtitle, movies, accentColor = '#E50914', loading, platformRef, onInfo }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

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
    <div className="relative mb-5 sm:mb-8">
      <div className="flex items-end gap-2 sm:gap-3 mb-3 sm:mb-5 px-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full" style={{ backgroundColor: accentColor }} />
          <div>
            <h2 className="text-sm sm:text-lg md:text-2xl font-bold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
      </div>

      <div className="relative">
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
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] pointer-events-none">
                  <div className="aspect-[2/3] rounded-xl bg-zinc-900 animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-zinc-900 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-zinc-900 rounded animate-pulse w-1/2" />
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
