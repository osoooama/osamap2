"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Play, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getPosterUrl, getMatchPercent, getYear } from "@/lib/utils";
import { searchMulti, type TMDBMovie } from "@/lib/tmdb";

interface SearchBarProps {
  className?: string;
  onPlay?: (movie: TMDBMovie) => void;
  onInfo?: (movie: TMDBMovie) => void;
}

export default function SearchBar({ className, onPlay, onInfo }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchMulti(searchQuery);
      setResults(data.slice(0, 8));
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-zinc-400 hover:text-white transition-colors p-2"
      >
        <Search className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="absolute left-0 top-0 flex items-center"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="البحث عن أفلام ومسلسلات..."
                className="w-56 sm:w-72 bg-zinc-900/90 border border-zinc-700 text-white text-sm rounded-lg pl-10 pr-9 py-2 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-500 backdrop-blur-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {query && results.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 z-50">
                {loading ? (
                  <div className="p-4 text-center text-zinc-500 text-sm">جاري البحث...</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {results.map((movie) => (
                      <div
                        key={movie.id}
                        className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        onClick={() => {
                          onInfo?.(movie);
                          setIsOpen(false);
                          setQuery("");
                        }}
                      >
                        <div className="w-10 h-14 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                          {movie.poster_path ? (
                            <img
                              src={getPosterUrl(movie.poster_path)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-zinc-600 text-xs">?</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {movie.title || movie.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            {getYear(movie.release_date || movie.first_air_date) && (
                              <span>{getYear(movie.release_date || movie.first_air_date)}</span>
                            )}
                            {movie.vote_average > 0 && (
                              <span className="text-emerald-400">
                                {getMatchPercent(movie.vote_average)}%
                              </span>
                            )}
                            <span>{movie.media_type === "tv" ? "مسلسل" : "فيلم"}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlay?.(movie);
                          }}
                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center shadow-2xl">
                <p className="text-zinc-500 text-sm">لا توجد نتائج لـ &quot;{query}&quot;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
