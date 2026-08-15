"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  getByGenre,
  type TMDBMovie,
} from "@/lib/tmdb";

interface UseMoviesResult {
  data: TMDBMovie[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

type Fetcher = () => Promise<TMDBMovie[]>;

export function useMovies(fetcher: Fetcher, deps: unknown[] = []): UseMoviesResult {
  const [data, setData] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setData([]);
    }
    setIsLoading(false);
  }, [fetcher]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useTrending() {
  return useMovies(() => getTrending("week"));
}

export function usePopular(type: "movie" | "tv" = "movie") {
  return useMovies(() => getPopular(type), [type]);
}

export function useTopRated(type: "movie" | "tv" = "movie") {
  return useMovies(() => getTopRated(type), [type]);
}

export function useNowPlaying() {
  return useMovies(() => getNowPlaying());
}

export function useUpcoming() {
  return useMovies(() => getUpcoming());
}

export function useByGenre(genreId: number, type: "movie" | "tv" = "movie") {
  return useMovies(() => getByGenre(genreId, type), [genreId, type]);
}
