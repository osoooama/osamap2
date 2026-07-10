import { useQuery } from '@tanstack/react-query';
import { getMovies } from '@/lib/api';

export function useMovies(category: string, page = 1) {
  return useQuery({
    queryKey: ['movies', category, page],
    queryFn: () => getMovies(category, page),
  });
}
