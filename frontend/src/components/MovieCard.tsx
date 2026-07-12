'use client';

import { useRouter } from 'next/navigation';
import { Play, Star, Calendar, Tv } from 'lucide-react';
import { useState } from 'react';

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
}

export default function MovieCard({ movie, accentColor = '#E50914' }: MovieCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const tmdbId = movie.tmdb_id;
  const title = movie.title || 'Unknown';
  const mediaType = movie.media_type || 'movie';
  const posterUrl = movie.poster || movie.poster_path || '';
  const imgSrc = posterUrl.startsWith('http')
    ? posterUrl
    : posterUrl
      ? `https://image.tmdb.org/t/p/w500${posterUrl}`
      : '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const genreNames = movie.genres?.slice(0, 2).map(g => g.name).join('، ') || movie.genre || '';
  const overview = movie.overview || '';

  const handleOpenPlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tmdbId) router.push(`/player?tmdb_id=${tmdbId}&type=${mediaType}`);
  };

  return (
    <div
      onClick={() => tmdbId && router.push(`/player?tmdb_id=${tmdbId}&type=${mediaType}`)}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shadow-lg shadow-black/20 group-hover:shadow-xl group-hover:shadow-black/40 transition-all duration-500">
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-[0.4]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-zinc-600 text-5xl font-black">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
            style={{ backgroundColor: accentColor }}
            onClick={handleOpenPlayer}
          >
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

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
          {year && (
            <div className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs text-zinc-300 border border-white/10">
              {year}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 px-0.5 space-y-1">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {year}
            </span>
          )}
          {rating && <Star className="w-3 h-3 text-yellow-500" />}
        </div>
        {genreNames && (
          <p className="text-xs text-zinc-600 truncate">{genreNames}</p>
        )}
        {overview && (
          <p className="text-xs text-zinc-700 line-clamp-2 leading-relaxed">
            {overview}
          </p>
        )}
      </div>
    </div>
  );
}
