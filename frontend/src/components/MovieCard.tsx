'use client';

import { useRouter } from 'next/navigation';
import { Play, Star, Tv, Info } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: {
    tmdb_id?: string;
    title?: string;
    poster_path?: string;
    poster?: string;
    backdrop_path?: string;
    vote_average?: number;
    vote_count?: number;
    release_date?: string;
    overview?: string;
    genre?: string;
    genres?: { id: number; name: string }[];
    runtime?: number;
    category?: string;
    media_type?: string;
  };
  accentColor?: string;
  platformColor?: string;
}

export default function MovieCard({ movie, accentColor = '#E50914' }: MovieCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const tmdbId = movie.tmdb_id;
  const title = movie.title || 'Unknown';
  const mediaType = movie.media_type || 'movie';
  const posterUrl = movie.poster || movie.poster_path || '';
  const backdropUrl = movie.backdrop_path || '';
  const imgSrc = posterUrl.startsWith('http') ? posterUrl : posterUrl ? `https://image.tmdb.org/t/p/w500${posterUrl}` : '';
  const backdropSrc = backdropUrl ? `https://image.tmdb.org/t/p/w780${backdropUrl}` : imgSrc;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const genreNames = movie.genres?.slice(0, 2).map(g => g.name).join('، ') || movie.genre || '';
  const overview = movie.overview || '';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tmdbId) router.push(`/player?tmdb_id=${tmdbId}&type=${mediaType}`);
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => tmdbId && router.push(`/player?tmdb_id=${tmdbId}&type=${mediaType}`)}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] cursor-pointer"
      layout
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shadow-lg shadow-black/20 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/50 group-hover:scale-[1.02]">
        {imgSrc && !imgError ? (
          <img
            src={backdropSrc || imgSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-zinc-600 text-5xl font-black">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col justify-end p-4"
        >
          <div className="flex gap-2 mb-2">
            <button
              onClick={handlePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl"
              style={{ backgroundColor: accentColor }}
            >
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (tmdbId) router.push(`/player?tmdb_id=${tmdbId}&type=${mediaType}`); }}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Info className="w-4 h-4 text-white" />
            </button>
          </div>
          {overview && (
            <p className="text-[10px] text-zinc-300 line-clamp-2 leading-relaxed">{overview}</p>
          )}
        </motion.div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs border border-white/10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-semibold">{rating}</span>
        </div>

        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {mediaType === 'tv' && (
            <div className="px-2 py-1 rounded-lg bg-blue-600/80 backdrop-blur-md text-xs text-white font-semibold border border-white/10 flex items-center gap-1">
              <Tv className="w-3 h-3" />
              مسلسل
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 px-0.5 space-y-1">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {year && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {rating}
            </span>
          )}
        </div>
        {genreNames && (
          <p className="text-xs text-zinc-600 truncate">{genreNames}</p>
        )}
      </div>
    </motion.div>
  );
}
