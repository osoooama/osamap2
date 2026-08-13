'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DisneyCard from './DisneyCard';

interface DisneyMovie {
  tmdb_id?: string;
  id?: string | number;
  [key: string]: unknown;
}

interface DisneyRowProps {
  title: string;
  subtitle?: string;
  movies: DisneyMovie[];
  loading?: boolean;
  onInfo?: (movie: DisneyMovie) => void;
  onPlay?: (movie: DisneyMovie) => void;
}

export default function DisneyRow({ title, subtitle, movies, loading, onInfo, onPlay }: DisneyRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    const amount = rowRef.current.offsetWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="mb-3 px-4 sm:px-8">
          <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 px-4 sm:px-8 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-[280px]">
              <div className="aspect-video bg-zinc-800 rounded-lg animate-pulse" />
              <div className="mt-2 h-4 w-32 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) return null;

  return (
    <div className="py-4 relative group/row">
      <div className="mb-3 px-4 sm:px-8">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative">
        <button
          aria-label="التمرير لليسار"
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-8 w-12 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <DisneyCard
              key={movie.tmdb_id || movie.id}
              movie={movie}
              onInfo={onInfo}
              onPlay={onPlay}
            />
          ))}
        </div>

        <button
          aria-label="التمرير لليمين"
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-8 w-12 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
