"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getArabicMovies,
  getArabicTV,
  getTurkishMovies,
  getTurkishTV,
  getTrending,
  type TMDBMovie,
} from "@/lib/tmdb";

interface UseContentResult {
  data: TMDBMovie[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useContentFetcher(fetcher: () => Promise<TMDBMovie[]>, deps: unknown[] = []): UseContentResult {
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

export function useArabicMovies() {
  return useContentFetcher(useCallback(() => getArabicMovies(), []));
}

export function useArabicTV() {
  return useContentFetcher(useCallback(() => getArabicTV(), []));
}

export function useTurkishMovies() {
  return useContentFetcher(useCallback(() => getTurkishMovies(), []));
}

export function useTurkishTV() {
  return useContentFetcher(useCallback(() => getTurkishTV(), []));
}

export function useTrending() {
  return useContentFetcher(useCallback(() => getTrending("week"), []));
}

export function useArabicContent() {
  const movies = useArabicMovies();
  const tv = useArabicTV();
  return {
    movies: movies.data,
    tv: tv.data,
    isLoading: movies.isLoading || tv.isLoading,
    moviesLoading: movies.isLoading,
    tvLoading: tv.isLoading,
  };
}

export function useTurkishContent() {
  const movies = useTurkishMovies();
  const tv = useTurkishTV();
  return {
    movies: movies.data,
    tv: tv.data,
    isLoading: movies.isLoading || tv.isLoading,
    moviesLoading: movies.isLoading,
    tvLoading: tv.isLoading,
  };
}
