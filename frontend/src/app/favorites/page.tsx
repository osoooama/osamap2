'use client';
import { useFavoritesStore } from '@/stores/favorites';
import { useThemeStore } from '@/stores/theme';
import { MovieCard } from '@/components/movie/MovieCard';

export default function FavoritesPage() {
  const theme = useThemeStore((s) => s.theme);
  const getByPlatform = useFavoritesStore((s) => s.getByPlatform);
  const items = getByPlatform(theme);

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">المفضلة</h1>
      {items.length === 0 ? (
        <p className="text-zinc-500 text-center mt-16">لا توجد عناصر في المفضلة</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <MovieCard
              key={item.movieId}
              id={item.movieId}
              tmdbId={item.tmdbId}
              title={item.title}
              posterPath={item.posterPath}
              platform={item.platform}
            />
          ))}
        </div>
      )}
    </div>
  );
}
