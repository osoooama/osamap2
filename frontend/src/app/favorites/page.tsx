'use client';

import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Film, ArrowLeft } from 'lucide-react';
import { useToastStore } from '@/lib/useToast';

interface Favorite {
  tmdb_id: string;
  title: string;
  poster: string;
  media_type: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  genres?: { id: number; name: string }[];
  overview?: string;
}

function FavoritesContent() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { addToast } = useToastStore();

  useEffect(() => {
    const stored = localStorage.getItem('osk_favorites');
    if (stored) {
      try { setFavorites(JSON.parse(stored)); } catch { setFavorites([]); }
    }
  }, []);

  const removeFavorite = (tmdbId: string) => {
    const updated = favorites.filter(f => f.tmdb_id !== tmdbId);
    setFavorites(updated);
    localStorage.setItem('osk_favorites', JSON.stringify(updated));
    addToast({ title: 'تمت الإزالة', description: 'تم حذف العنصر من المفضلة', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-600/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white font-arabic-display">المفضلة</h1>
            <p className="text-zinc-500 text-sm">العناوين التي حفظتها لمشاهدتها لاحقاً</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg">المفضلة فارغة</p>
            <p className="text-zinc-700 text-sm mt-1">أضف أفلاماً ومسلسلات إلى مفضلتك لمشاهدتها لاحقاً</p>
            <Link
              href="/netflix"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              تصفح المحتوى
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {favorites.map((movie) => {
              const imgSrc = movie.poster?.startsWith('http') ? movie.poster : movie.poster ? `https://image.tmdb.org/t/p/w500${movie.poster}` : '';
              return (
                <div key={movie.tmdb_id} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900">
                  <Link href={`/player?tmdb_id=${movie.tmdb_id}&type=${movie.media_type}`}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={movie.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Film className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-bold truncate">{movie.title}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                        {movie.vote_average != null && movie.vote_average > 0 && <span className="text-yellow-500">⭐ {movie.vote_average.toFixed(1)}</span>}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(movie.tmdb_id)}
                    className="absolute top-2 left-2 p-2.5 rounded-lg bg-black/70 text-zinc-400 hover:text-red-400 hover:bg-black/90 transition-all md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {movie.media_type === 'tv' && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-blue-600/80 text-[10px] text-white">TV</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <AuthGuard>
      <FavoritesContent />
    </AuthGuard>
  );
}
