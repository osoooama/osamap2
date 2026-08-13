'use client';

import { useRef, useState } from 'react';
import { Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Top10Movie {
  tmdb_id?: string;
  poster?: string;
  poster_path?: string;
  title?: string;
  [key: string]: unknown;
}

interface Top10RowProps {
  title: string;
  subtitle?: string;
  movies: Top10Movie[];
  accentColor?: string;
  onInfo?: (movie: Top10Movie) => void;
}

export default function Top10Row({ title, subtitle, movies, accentColor = '#E50914', onInfo }: Top10RowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!movies || movies.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative mb-5 sm:mb-8">
      <div className="flex items-end gap-2 sm:gap-3 mb-3 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full" style={{ backgroundColor: accentColor }} />
          <div>
            <h2 className="text-sm sm:text-lg md:text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
      </div>

      <div className="relative group/row">
        <button
          aria-label="التمرير لليسار"
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          aria-label="التمرير لليمين"
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-0 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.slice(0, 10).map((movie, idx) => {
            const posterUrl = movie.poster || movie.poster_path || '';
            const imgSrc = posterUrl.startsWith('http') ? posterUrl : posterUrl ? `https://image.tmdb.org/t/p/w500${posterUrl}` : '';
            const movieTitle = movie.title || 'غير معروف';
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={movie.tmdb_id || idx}
                className="flex-shrink-0 flex items-center gap-0"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="relative flex-shrink-0 w-[80px] sm:w-[100px] md:w-[120px] flex items-center justify-center">
                  <span
                    className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent select-none"
                    style={{
                      WebkitTextStroke: '2px rgba(255,255,255,0.3)',
                      lineHeight: 1,
                    }}
                  >
                    {idx + 1}
                  </span>
                </div>

                <motion.div
                  animate={{ scale: isHovered ? 1.05 : 1, zIndex: isHovered ? 20 : 1 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px] cursor-pointer"
                  onClick={() => {
                    if (movie.tmdb_id) onInfo?.(movie);
                  }}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 shadow-lg shadow-black/40">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={movieTitle}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <span className="text-zinc-600 text-3xl font-black">{movieTitle[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-2 left-2 right-2 flex gap-1.5"
                        >
                          <button
                            aria-label={`تشغيل ${movieTitle}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (movie.tmdb_id) onInfo?.(movie);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white hover:bg-white/90 transition shadow-xl"
                          >
                            <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                          </button>
                          <button
                            aria-label={`معلومات ${movieTitle}`}
                            onClick={(e) => { e.stopPropagation(); onInfo?.(movie); }}
                            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition"
                          >
                            <Info className="w-3.5 h-3.5 text-white" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
