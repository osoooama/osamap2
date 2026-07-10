'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieCard from '@/components/MovieCard';

export default function CrunchyrollPage() {
  const { data: movies, isLoading } = useMovies('anime');

  return (
    <div className="min-h-screen bg-crunchyroll text-white">
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="text-3xl font-bold text-crunchyroll">Crunchyroll</h1>
      </header>
      <main className="px-8 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-crunchyroll border-t-transparent" />
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
