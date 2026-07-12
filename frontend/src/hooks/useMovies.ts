'use client';

import { useQuery } from '@tanstack/react-query';
import { getMovies } from '@/lib/api';

export function useMovies(category: string, page = 1, type?: string) {
  return useQuery({
    queryKey: ['movies', category, page, type],
    queryFn: async () => {
      const data = await getMovies(category, page, type);
      return Array.isArray(data) ? data : (data.items || []);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useMovieDetails(tmdbId: string) {
  return useQuery({
    queryKey: ['movie', tmdbId],
    queryFn: async () => {
      const { default: api } = await import('@/lib/api');
      const { data } = await api.get(`/api/movies/details/${tmdbId}`);
      return data;
    },
    enabled: !!tmdbId,
    staleTime: 10 * 60 * 1000,
  });
}
