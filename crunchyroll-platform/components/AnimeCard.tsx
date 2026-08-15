"use client";

import { useState } from "react";
import { Play, Star } from "lucide-react";
import { cn, type JikanAnime } from "@/lib/utils";

interface AnimeCardProps {
  anime: JikanAnime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = anime.title_english || anime.title;
  const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.webp?.large_image_url;
  const score = anime.score;
  const episodes = anime.episodes;
  const year = anime.year;

  return (
    <a
      href={`/anime/${anime.mal_id}`}
      className="relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#14141f] shadow-lg shadow-black/30 transition-all duration-500 group-hover:shadow-[0_8px_40px_-8px_rgba(244,117,33,0.3)] group-hover:scale-[1.03] group-hover:-translate-y-1">
        {imageUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-[#14141f] animate-pulse">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className={cn(
                "w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-[0.4]",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#14141f] to-[#0a0a0f]">
            <span className="text-[#F47521]/30 text-3xl font-black">{title[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-[#F47521] flex items-center justify-center shadow-xl shadow-[#F47521]/30 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] border border-white/10">
            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
            <span className="text-yellow-500 font-bold">{score}</span>
          </div>
        )}

        {anime.airing && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#F47521]/80 backdrop-blur-md text-[9px] text-white font-bold border border-white/10 animate-pulse">
            AIRING
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5 space-y-0.5">
        <h3 className="text-[11px] sm:text-xs font-semibold text-white truncate leading-tight group-hover:text-[#F47521] transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          {year && <span>{year}</span>}
          {episodes && <span>{episodes} eps</span>}
        </div>
      </div>
    </a>
  );
}
