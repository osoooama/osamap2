'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieCard from '@/components/MovieCard';

export default function NetflixPage() {
  const { data: movies, isLoading } = useMovies('foreign');

  return (
    <div className="min-h-screen bg-netflix text-white">
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="text-3xl font-bold text-netflix">NETFLIX</h1>
      </header>
      <main className="px-8 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-netflix border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {movies?.map((m: any) => (
              <MovieCard key={m.tmdb_id} movie={m} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
