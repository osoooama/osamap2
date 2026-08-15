"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, JIKAN_BASE, type JikanAnime } from "@/lib/utils";
import AnimeCard from "./AnimeCard";

async function fetchWithRetry(url: string, retries = 2): Promise<JikanAnime[]> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data || [];
    } catch {
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return [];
}

interface AnimeRowProps {
  title: string;
  fetchUrl: string;
  fallbackUrl?: string;
  id?: string;
}

function AnimeRow({ title, fetchUrl, fallbackUrl, id }: AnimeRowProps) {
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchWithRetry(fetchUrl);
      if (data.length === 0 && fallbackUrl) {
        await new Promise((r) => setTimeout(r, 1500));
        const fallbackData = await fetchWithRetry(fallbackUrl);
        if (mounted) setAnime(fallbackData);
      } else {
        if (mounted) setAnime(data);
      }
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [fetchUrl, fallbackUrl]);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  const scroll = useCallback(
    (dir: "left" | "right") => {
      if (!scrollRef.current) return;
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -amount : amount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 400);
    },
    [checkScroll]
  );

  return (
    <div className="relative mb-6 sm:mb-8 group/row" id={id}>
      <div className="flex items-center gap-3 mb-3 sm:mb-5 px-4 sm:px-6 lg:px-8">
        <div className="w-1 h-5 rounded-full bg-[#F47521]" />
        <h2 className="text-sm sm:text-lg md:text-xl font-bold text-white">{title}</h2>
        {anime.length > 0 && (
          <a href="/" className="text-zinc-500 hover:text-[#F47521] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 mr-auto">
            View All
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </a>
        )}
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute right-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-l from-[#0a0a0f] via-[#0a0a0f]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-l-lg"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute left-0 top-0 bottom-3 z-20 w-10 sm:w-12 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-r-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-3 px-4 sm:px-6 lg:px-8 select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={checkScroll}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
                  <div className="aspect-[2/3] rounded-lg bg-[#14141f] animate-pulse overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="mt-2 space-y-1.5 px-0.5">
                    <div className="h-3 bg-[#14141f] rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-[#14141f] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            : anime.map((a) => (
                <div key={a.mal_id} className="flex-shrink-0">
                  <AnimeCard anime={a} />
                </div>
              ))}
        </div>
      </div>

      {!loading && anime.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">No anime available</p>
        </div>
      )}
    </div>
  );
}

export default function AnimeGrid() {
  return (
    <div className="space-y-6 sm:space-y-8 py-6 sm:py-8">
      <div id="simulcasts">
        <AnimeRow
          title="Currently Airing"
          fetchUrl={`${JIKAN_BASE}/seasons/now?limit=15`}
          fallbackUrl={`${JIKAN_BASE}/top/anime?filter=airing&limit=15`}
        />
      </div>
      <div id="popular">
        <AnimeRow
          title="Most Popular"
          fetchUrl={`${JIKAN_BASE}/top/anime?filter=bypopularity&limit=15`}
          fallbackUrl={`${JIKAN_BASE}/top/anime?limit=15`}
        />
      </div>
      <div id="new">
        <AnimeRow
          title="Top Rated"
          fetchUrl={`${JIKAN_BASE}/top/anime?filter=ranked&limit=15`}
          fallbackUrl={`${JIKAN_BASE}/top/anime?limit=15`}
        />
      </div>
      <AnimeRow
        title="Upcoming"
        fetchUrl={`${JIKAN_BASE}/top/anime?filter=upcoming&limit=15`}
        fallbackUrl={`${JIKAN_BASE}/seasons/2026/summer?limit=15`}
      />
      <AnimeRow
        title="TV Series"
        fetchUrl={`${JIKAN_BASE}/top/anime?filter=tv&limit=15`}
        fallbackUrl={`${JIKAN_BASE}/top/anime?order_by=members&sort=desc&limit=15`}
      />
    </div>
  );
}
