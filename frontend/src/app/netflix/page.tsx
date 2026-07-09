'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MovieCard } from '@/components/movie/MovieCard';
import { useSelectedMovie } from '@/stores/selectedMovie';
import { fetchTrending, fetchPopular, fetchTopRated, fetchByGenre, fetchGenres, posterUrl, backdropUrl, TMDBMovie, TMDBGenre } from '@/lib/tmdb';

export default function NetflixPage() {
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [popular, setPopular] = useState<TMDBMovie[]>([]);
  const [topRated, setTopRated] = useState<TMDBMovie[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [genreMovies, setGenreMovies] = useState<Record<number, TMDBMovie[]>>({});
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const setSelectedMovie = useSelectedMovie((s) => s.set);

  useEffect(() => {
    async function load() {
      const [tr, pop, top, gs] = await Promise.all([
        fetchTrending(), fetchPopular(), fetchTopRated(), fetchGenres()
      ]);
      setTrending(tr.slice(0, 12));
      setPopular(pop.slice(0, 12));
      setTopRated(top.slice(0, 10));
      setGenres(gs.slice(0, 8));

      const genreMap: Record<number, TMDBMovie[]> = {};
      for (const g of gs.slice(0, 6)) {
        const movies = await fetchByGenre(g.id);
        genreMap[g.id] = movies.slice(0, 8);
      }
      setGenreMovies(genreMap);
      setLoading(false);
    }
    load();
  }, []);

  const hero = trending[0];
  const rows = [
    { title: 'الأكثر مشاهدة هذا الأسبوع', movies: trending },
    { title: 'أفلام شائعة', movies: popular },
    { title: 'الأعلى تقييماً', movies: topRated },
    ...genres.filter(g => genreMovies[g.id]?.length).map(g => ({ title: g.name, movies: genreMovies[g.id] || [] })),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-zinc-400">جاري تحميل الأفلام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero */}
      {hero && (
        <div className="relative h-[80vh] overflow-hidden">
          {hero.backdrop_path && (
            <Image src={backdropUrl(hero.backdrop_path)} alt={hero.title} fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(229,9,20,0.2) 0%, transparent 60%)' }} />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded mb-3 inline-block">الأكثر مشاهدة</span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3">{hero.title}</h1>
              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="text-green-500 font-semibold">{hero.vote_average?.toFixed(1)}/10</span>
                <span className="text-zinc-400">{hero.release_date?.split('-')[0]}</span>
              </div>
              <p className="text-zinc-300 max-w-xl mb-6 line-clamp-3">{hero.overview}</p>
              <div className="flex gap-3">
                <button onClick={() => setSelectedMovie(hero.id)} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> تشغيل
                </button>
                <button onClick={() => setSelectedMovie(hero.id)} className="px-8 py-3 bg-zinc-500/30 text-white rounded-xl border border-white/10 font-semibold hover:bg-zinc-500/50 transition-all backdrop-blur-sm flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> معلومات
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Genre Filter */}
      <div className="relative z-20 -mt-16 mb-6 px-8 md:px-16">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveGenre(null)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!activeGenre ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>الكل</button>
          {genres.map(g => (
            <button key={g.id} onClick={() => setActiveGenre(g.id)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeGenre === g.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{g.name}</button>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-8 pb-16 px-8 md:px-16">
        {rows.filter(r => r.movies.length > 0).map((row) => (
          <motion.section key={row.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{row.title}</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {row.movies.map((movie, i) => (
                <div key={movie.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                  <MovieCard id={`netflix-${movie.id}`} tmdbId={movie.id} title={movie.title} posterPath={movie.poster_path || ''} rating={movie.vote_average} platform="netflix" />
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
