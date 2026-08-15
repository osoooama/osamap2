"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Star, Filter } from "lucide-react";
import { cn, JIKAN_BASE, type JikanAnime } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeCard from "@/components/AnimeCard";

const GENRES = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 14, name: "Horror" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" },
  { id: 25, name: "Sports" },
  { id: 36, name: "Slice of Life" },
  { id: 27, name: "Supernatural" },
  { id: 41, name: "Suspense" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (q: string, genre?: number | null) => {
    setLoading(true);
    setHasSearched(true);
    try {
      let url = `${JIKAN_BASE}/anime?page=1&limit=24`;
      if (q.trim()) url += `&q=${encodeURIComponent(q)}`;
      if (genre) url += `&genres=${genre}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.data || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query || selectedGenre) {
        handleSearch(query, selectedGenre);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, selectedGenre, handleSearch]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-12" dir="ltr">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">
          Search <span className="text-[#F47521]">Anime</span>
        </h1>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-[#14141f] border border-white/10 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#F47521]/50 focus:ring-1 focus:ring-[#F47521]/30 placeholder:text-zinc-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedGenre(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              !selectedGenre
                ? "bg-[#F47521] text-white"
                : "bg-[#14141f] text-zinc-400 border border-white/10 hover:border-[#F47521]/30"
            )}
          >
            All
          </button>
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(selectedGenre === g.id ? null : g.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedGenre === g.id
                  ? "bg-[#F47521] text-white"
                  : "bg-[#14141f] text-zinc-400 border border-white/10 hover:border-[#F47521]/30"
              )}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-[#14141f] animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {results.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">No results found</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">Start typing to search anime</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
