"use client";

import { cn, getPosterUrl, getMatchPercent, getYear } from "@/lib/utils";
import type { TMDBMovie } from "@/lib/tmdb";

interface BrandRowProps {
  title: string;
  movies: TMDBMovie[];
  onInfo?: (movie: TMDBMovie) => void;
}

export default function BrandRow({ title, movies, onInfo }: BrandRowProps) {
  if (movies.length === 0) return null;

  return (
    <div className="mb-8 sm:mb-10" dir="rtl">
      <div className="flex items-center gap-3 mb-3 sm:mb-5 px-4 sm:px-6 lg:px-8">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0063E5] to-[#1F1F4B]" />
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {movies.slice(0, 5).map((movie) => {
          const posterUrl = movie.poster_path ? getPosterUrl(movie.poster_path) : "";
          const rating = getMatchPercent(movie.vote_average);
          const year = getYear(movie.release_date || movie.first_air_date);
          const title = movie.title || movie.name || "";

          return (
            <div
              key={movie.id}
              className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-[#16163A] shadow-lg shadow-black/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#0063E5]/10 hover:-translate-y-1"
              onClick={() => onInfo?.(movie)}
            >
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#16163A] to-[#0C111B]">
                  <span className="text-[#0063E5]/30 text-3xl font-black">{title[0]}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#0C111B]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs sm:text-sm font-bold line-clamp-1 mb-1">{title}</p>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                  {rating > 0 && <span className="text-[#0063E5] font-semibold">{rating}%</span>}
                  {year && <span className="text-zinc-400">{year}</span>}
                </div>
              </div>

              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#0063E5]/80 backdrop-blur-md text-[10px] text-white font-semibold border border-white/10">
                {rating}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
