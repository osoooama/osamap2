'use client';

import { useQuery } from '@tanstack/react-query';
import { getMovies } from '@/lib/api';

export function useMovies(category: string, page = 1) {
  return useQuery({
    queryKey: ['movies', category, page],
    queryFn: () => getMovies(category, page),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}