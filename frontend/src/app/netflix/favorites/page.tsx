'use client';
import { useFavoritesStore } from '@/stores/favorites';
import { MovieCard } from '@/components/movie/MovieCard';

export default function NetflixFavorites() {
  const items = useFavoritesStore((s) => s.getByPlatform('netflix'));

  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <h1 className="text-2xl font-bold text-white mb-6">المفضلة - Netflix</h1>
      {items.length === 0 ? (
        <p className="text-zinc-400">لم تقم بإضافة أي أفلام بعد</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <MovieCard key={item.movieId} id={item.movieId} tmdbId={item.tmdbId} title={item.title} posterPath={item.posterPath} platform="netflix" />
          ))}
        </div>
      )}
    </div>
  );
}
