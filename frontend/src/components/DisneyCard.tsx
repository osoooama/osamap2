'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star } from 'lucide-react';

interface DisneyCardProps {
  movie: {
    tmdb_id?: string;
    title?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average?: number;
    release_date?: string;
    overview?: string;
    genres?: { id: number; name: string }[];
    media_type?: string;
  };
  onInfo?: (movie: any) => void;
  onPlay?: (movie: any) => void;
}

export default function DisneyCard({ movie, onInfo, onPlay }: DisneyCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = movie.title || 'غير معروف';
  const backdropUrl = movie.backdrop_path || '';
  const rating = movie.vote_average ? Math.round(movie.vote_average * 10) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const imgSrc = backdropUrl
    ? backdropUrl.startsWith('http')
      ? backdropUrl
      : `https://image.tmdb.org/t/p/w780${backdropUrl}`
    : '';

  return (
    <div
      className="relative flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px] cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onInfo?.(movie)}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 shadow-md shadow-black/20 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_8px_40px_-8px_rgba(201,168,76,0.25)] ring-0 group-hover:ring-1 ring-[#C9A84C]/20">
        {imgSrc && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
            <img
              src={imgSrc}
              alt={title}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-zinc-600 text-3xl font-bold">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] border border-[#C9A84C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Star className="w-3 h-3 text-[#C9A84C] fill-[#C9A84C]" />
            <span className="text-[#C9A84C] font-bold">{rating}%</span>
          </div>
        )}

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-3 right-3 flex items-center gap-2"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onPlay?.(movie); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-[#C9A84C] hover:text-black transition shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                تشغيل
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onInfo?.(movie); }}
                className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white hover:bg-[#C9A84C]/20 hover:border-[#C9A84C]/30 transition"
              >
                <Info className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 px-1">
        <h3 className="text-sm font-semibold text-white truncate transition-colors group-hover:text-[#C9A84C]">{title}</h3>
        {year && <p className="text-[10px] text-zinc-500 mt-0.5">{year}</p>}
      </div>
    </div>
  );
}
