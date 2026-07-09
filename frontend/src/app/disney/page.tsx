'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MovieCard } from '@/components/movie/MovieCard';
import { useSelectedMovie } from '@/stores/selectedMovie';
import { fetchPopular, fetchTrending, fetchByGenre, fetchGenres, posterUrl, backdropUrl, TMDBMovie, TMDBGenre } from '@/lib/tmdb';

export default function DisneyPage() {
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [popular, setPopular] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const setSelectedMovie = useSelectedMovie((s) => s.set);

  useEffect(() => {
    async function load() {
      const [tr, pop] = await Promise.all([fetchTrending(), fetchPopular()]);
      setTrending(tr.slice(0, 12));
      setPopular(pop.slice(0, 12));
      setLoading(false);
    }
    load();
  }, []);

  const hero = trending[0];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #000B1A, #001940)' }}>
      <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #000B1A 0%, #001940 100%)' }}>
      {hero && (
        <div className="relative h-[75vh] overflow-hidden">
          {hero.backdrop_path && <Image src={backdropUrl(hero.backdrop_path)} alt={hero.title} fill className="object-cover" priority />}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(17,60,207,0.15) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000B1A] via-[#000B1A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000B1A]/90 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3">{hero.title}</h1>
              <p className="text-zinc-300 max-w-xl mb-6 line-clamp-3">{hero.overview}</p>
              <div className="flex gap-3">
                <button onClick={() => setSelectedMovie(hero.id)} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> تشغيل
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div className="space-y-8 pb-16 px-8 md:px-16 relative z-10">
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">أفلام رائجة</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {trending.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                <MovieCard id={`disney-trend-${movie.id}`} tmdbId={movie.id} title={movie.title} posterPath={movie.poster_path || ''} rating={movie.vote_average} platform="disney" />
              </div>
            ))}
          </div>
        </motion.section>
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">الأكثر شهرة</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {popular.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                <MovieCard id={`disney-pop-${movie.id}`} tmdbId={movie.id} title={movie.title} posterPath={movie.poster_path || ''} rating={movie.vote_average} platform="disney" />
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
