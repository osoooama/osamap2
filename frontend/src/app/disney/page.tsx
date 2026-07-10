'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieCard from '@/components/MovieCard';

export default function DisneyPage() {
  const { data: movies, isLoading } = useMovies('animation');

  return (
    <div className="min-h-screen bg-disney text-white">
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="text-3xl font-bold text-disney">DISNEY+</h1>
      </header>
      <main className="px-8 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-disney border-t-transparent" />
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
