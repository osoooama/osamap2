'use client';
import { useState, useEffect } from 'react';
import { useSelectedMovie } from '@/stores/selectedMovie';
import { VideoPlayer } from './VideoPlayer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function MovieDetailModal() {
  const { tmdbId, set } = useSelectedMovie();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tmdbId) { setMovie(null); return; }
    setLoading(true);
    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
      .then(r => r.json())
      .then(data => { setMovie(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tmdbId]);

  return (
    <Dialog open={!!tmdbId} onOpenChange={(open) => { if (!open) set(null); }}>
      <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
        {loading && <p className="text-center py-8 text-zinc-400">جاري التحميل...</p>}
        {!loading && movie && (
          <div>
            {movie.backdrop_path && (
              <div
                className="w-full h-48 md:h-64 bg-cover bg-center rounded-lg mb-4"
                style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
              />
            )}
            <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
            <div className="flex items-center gap-3 text-sm text-zinc-400 mb-4 flex-wrap">
              <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date}</span>
              {movie.genres?.map((g: any) => (
                <span key={g.id} className="px-2 py-0.5 rounded bg-zinc-800 text-xs">{g.name}</span>
              ))}
            </div>
            <p className="text-zinc-300 mb-4">{movie.overview}</p>
            <VideoPlayer
              src={`https://embed.some-site.com/movie/${tmdbId}`}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
