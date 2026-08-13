'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info } from 'lucide-react';

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
      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 shadow-md shadow-black/20 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-xl group-hover:shadow-black/30">
        {imgSrc && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
            )}
            <img
              src={imgSrc}
              alt={title}
              loading="lazy"
              className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-zinc-600 text-3xl font-bold">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition shadow-lg"
              >
                <Play className="w-4 h-4 fill-black" />
                تشغيل
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onInfo?.(movie); }}
                className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-white hover:bg-white/30 transition"
              >
                <Info className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 px-1">
        <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
      </div>
    </div>
  );
}
