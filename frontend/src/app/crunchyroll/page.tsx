'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MovieCard } from '@/components/movie/MovieCard';
import { useSelectedMovie } from '@/stores/selectedMovie';
import { fetchTrending, fetchPopular, fetchByGenre, fetchGenres, posterUrl, backdropUrl, TMDBMovie, TMDBGenre } from '@/lib/tmdb';

export default function CrunchyrollPage() {
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [popular, setPopular] = useState<TMDBMovie[]>([]);
  const [action, setAction] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const setSelectedMovie = useSelectedMovie((s) => s.set);

  useEffect(() => {
    async function load() {
      const [tr, pop, act] = await Promise.all([fetchTrending(), fetchPopular(), fetchByGenre(28)]);
      setTrending(tr.slice(0, 12));
      setPopular(pop.slice(0, 12));
      setAction(act.slice(0, 10));
      setLoading(false);
    }
    load();
  }, []);

  const hero = trending[0];
  const rows = [
    { title: 'الأكثر مشاهدة هذا الأسبوع', tag: 'Simulcast', movies: trending },
    { title: 'أفلام أكشن ومغامرات', tag: 'مدبلج', movies: action },
    { title: 'الأكثر شهرة', tag: '', movies: popular },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0d0d0d, #1a0f0a)' }}>
      <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #1a0f0a 100%)' }}>
      {hero && (
        <div className="relative h-[75vh] overflow-hidden">
          {hero.backdrop_path && <Image src={backdropUrl(hero.backdrop_path)} alt={hero.title} fill className="object-cover" priority />}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(244,117,33,0.12) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/90 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="px-3 py-1 text-xs font-bold rounded" style={{ background: '#F47521', color: '#fff' }}>Simulcast</span>
              <h1 className="text-4xl md:text-6xl font-black text-white mt-3 mb-3">{hero.title}</h1>
              <p className="text-zinc-300 max-w-xl mb-6 line-clamp-3">{hero.overview}</p>
              <div className="flex gap-3">
                <button onClick={() => setSelectedMovie(hero.id)} className="px-8 py-3 rounded-xl text-white font-bold transition-all flex items-center gap-2 shadow-xl" style={{ background: 'linear-gradient(135deg, #F47521, #d45e0f)' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> تشغيل
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div className="space-y-8 pb-16 px-8 md:px-16 relative z-10">
        {rows.filter(r => r.movies.length > 0).map((row) => (
          <motion.section key={row.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">{row.title}</h2>
              {row.tag && <span className="px-2 py-0.5 text-xs font-semibold rounded" style={{ background: '#F47521', color: '#fff' }}>{row.tag}</span>}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {row.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                  <MovieCard id={`cr-${movie.id}`} tmdbId={movie.id} title={movie.title} posterPath={movie.poster_path || ''} rating={movie.vote_average} platform="crunchyroll" />
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
