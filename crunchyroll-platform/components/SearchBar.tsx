"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Play, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, JIKAN_BASE, type JikanAnime } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=6`);
      const data = await res.json();
      setResults(data.data || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, handleSearch]);

  return (
    <div className={cn("relative", className)} dir="ltr">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search anime..."
          className="w-full sm:w-80 bg-[#14141f]/80 border border-white/10 text-white text-sm rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#F47521]/50 focus:ring-1 focus:ring-[#F47521]/30 placeholder:text-zinc-600 backdrop-blur-sm transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && query && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#14141f] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 z-50"
          >
            {loading ? (
              <div className="p-4 text-center text-zinc-500 text-sm">Searching...</div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((anime) => (
                  <a
                    key={anime.mal_id}
                    href={`/anime/${anime.mal_id}`}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-14 rounded overflow-hidden bg-[#0a0a0f] flex-shrink-0">
                      {anime.images?.jpg?.small_image_url ? (
                        <img src={anime.images.jpg.small_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-zinc-700 text-xs">?</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{anime.title_english || anime.title}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        {anime.score && (
                          <span className="flex items-center gap-0.5 text-yellow-500">
                            <Star className="w-2.5 h-2.5 fill-yellow-500" /> {anime.score}
                          </span>
                        )}
                        {anime.type && <span>{anime.type}</span>}
                        {anime.episodes && <span>{anime.episodes} eps</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
