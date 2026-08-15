"use client";

import { useState, useEffect } from "react";
import { Play, Info, Star, Calendar, Clock } from "lucide-react";
import { cn, JIKAN_BASE, type JikanAnime } from "@/lib/utils";

const FALLBACK: JikanAnime = {
  mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood", title_english: "Fullmetal Alchemist: Brotherhood",
  title_japanese: null, images: { jpg: { image_url: "", large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg", small_image_url: "" }, webp: { image_url: "", large_image_url: "", small_image_url: "" } },
  type: "TV", source: "", episodes: 64, status: "", airing: false, aired: { from: "", to: null, string: "" }, duration: "", rating: "", score: 9.11, scored_by: null, rank: 1, popularity: 1, members: null, favorites: null,
  synopsis: "After a horrific alchemy experiment goes wrong, brothers Edward and Alphonse Elric are left in a catastrophic new reality. Ignoring the alchemical principle banning human transmutation, the boys attempted to bring their recently deceased mother back to life.",
  background: null, season: null, year: 2009, broadcast: { day: "", time: "", timezone: "", string: "" },
  genres: [{ mal_id: 1, name: "Action", type: "anime" }, { mal_id: 2, name: "Adventure", type: "anime" }, { mal_id: 10, name: "Fantasy", type: "anime" }],
  themes: [], demographics: [], producers: [], licensors: [], studios: [], explicit_genres: [], relations: [], theme: [], external: [], streaming: [],
};

export default function HeroSection() {
  const [anime, setAnime] = useState<JikanAnime>(FALLBACK);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await new Promise((r) => setTimeout(r, 2000));
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${JIKAN_BASE}/top/anime?limit=5&sfw=true`);
          if (!res.ok) throw new Error("fail");
          const data = await res.json();
          if (data.data?.length && active) { setAnime(data.data[0]); break; }
        } catch { await new Promise((r) => setTimeout(r, 2000 * (i + 1))); }
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const img = anime.images?.jpg?.large_image_url || anime.images?.webp?.large_image_url;
  const title = anime.title_english || anime.title;
  const genres = anime.genres?.slice(0, 3).map((g) => g.name) || [];

  return (
    <div className="relative h-[50vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] overflow-hidden bg-[#0a0a0f]">
      {img && <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover object-top animate-[fadeIn_1.2s_ease-out]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#0a0a0f]/80 to-[#F47521]/10" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0f]/95 via-[#0a0a0f]/60 to-[#0a0a0f]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-black/20" />
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />

      <div className="absolute bottom-[18%] sm:bottom-[22%] md:bottom-[25%] right-0 left-0 px-4 sm:px-8 md:px-14 lg:px-20 max-w-2xl animate-[slideIn_0.6s_ease-out_0.3s_both]">
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-0.5 rounded bg-[#F47521]/20 border border-[#F47521]/30">
            <span className="text-[#F47521] text-[10px] sm:text-xs font-bold tracking-wider">TOP RANKED</span>
          </div>
          {anime.score && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-yellow-500 text-[10px] sm:text-xs font-bold">{anime.score}</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] mb-3 drop-shadow-2xl">
          {title}
        </h1>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {genres.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-[#F47521]/10 text-[#F47521] text-[10px] sm:text-xs border border-[#F47521]/20">{g}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-zinc-400 mb-3">
          {anime.year && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {anime.year}</span>}
          {anime.episodes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {anime.episodes} eps</span>}
          {anime.type && <span>{anime.type}</span>}
        </div>

        {anime.synopsis && (
          <p className="text-zinc-300 text-[11px] sm:text-sm md:text-base max-w-lg line-clamp-3 leading-relaxed mb-4 drop-shadow-lg">
            {anime.synopsis}
          </p>
        )}

        <div className="flex items-center gap-3">
          <a href={`/anime/${anime.mal_id}`} className="flex items-center gap-2 px-6 py-2.5 bg-[#F47521] text-white font-bold rounded-lg hover:bg-[#E06510] transition-all duration-200 text-sm shadow-xl shadow-[#F47521]/20 hover:shadow-2xl hover:scale-105 active:scale-95">
            <Play className="w-4 h-4 fill-white" />
            Watch Now
          </a>
          <a href={`/anime/${anime.mal_id}`} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-200 text-sm backdrop-blur-sm border border-white/10">
            <Info className="w-4 h-4" />
            Details
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-[float_1.5s_ease-in-out_infinite]">
        <div className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}
