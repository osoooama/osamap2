'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieCard from '@/components/MovieCard';

export default function ShahidPage() {
  const { data: arabic, isLoading: loading1 } = useMovies('arabic');
  const { data: turkish, isLoading: loading2 } = useMovies('turkish');

  if (loading1 || loading2) {
    return (
      <div className="min-h-screen bg-shahid flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-shahid border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shahid text-white">
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="text-3xl font-bold text-shahid">Shahid</h1>
      </header>
      <main className="px-8 pb-12 space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-shahid">عربي</h2>
          <div className="flex flex-wrap gap-4">
            {arabic?.map((m: any) => (
              <MovieCard key={m.tmdb_id} movie={m} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4 text-shahid">تركي</h2>
          <div className="flex flex-wrap gap-4">
            {turkish?.map((m: any) => (
              <MovieCard key={m.tmdb_id} movie={m} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
