'use client';
import { useState } from 'react';
import { useSelectedMovie } from '@/stores/selectedMovie';
import { MovieCard } from '@/components/movie/MovieCard';
import { motion } from 'framer-motion';

interface Movie { id: string; title: string; year: string; rating: string; image: string; category: string; tmdbId?: number }

const genres = ['الكل', 'أكشن', 'دراما', 'خيال علمي', 'تشويق', 'كوميديا', 'رعب', 'تاريخي'];

const rows: { title: string; movies: Movie[] }[] = [
  { title: 'الأكثر مشاهدة', movies: Array.from({ length: 12 }, (_, i) => ({ id: `trending-${i}`, title: ['The Last Kingdom', 'Stranger Things', 'Money Heist', 'The Crown', 'Wednesday', 'Squid Game'][i % 6], year: ['2023','2024','2025','2026'][i % 4], rating: (8 + (i % 20) / 10).toFixed(1), image: `/placeholder.svg`, category: 'foreign' })) },
  { title: 'أفلام جديدة', movies: Array.from({ length: 10 }, (_, i) => ({ id: `new-${i}`, title: ['The Witcher', 'Dark', 'Breaking Bad', 'Black Mirror', 'Bridgerton', 'The Boys'][i % 6], year: '2026', rating: (9 + (i % 10) / 10).toFixed(1), image: `/placeholder.svg`, category: 'foreign' })) },
  { title: 'أفلام أكشن', movies: Array.from({ length: 8 }, (_, i) => ({ id: `action-${i}`, title: ['Extraction', 'The Gray Man', 'John Wick', 'Mad Max'][i % 4], year: ['2024','2025','2026'][i % 3], rating: (7.5 + (i % 15) / 10).toFixed(1), image: `/placeholder.svg`, category: 'foreign' })) },
  { title: 'مسلسلات دراما', movies: Array.from({ length: 8 }, (_, i) => ({ id: `drama-${i}`, title: ['Succession', 'Better Call Saul', 'Ozark', 'Yellowstone'][i % 4], year: '2025', rating: (8.5 + (i % 10) / 10).toFixed(1), image: `/placeholder.svg`, category: 'foreign' })) },
];

const heroMovie = { title: 'The Last Kingdom', desc: 'مغامرات ملحمية في عالم الفايكنج والإمبراطوريات القديمة. حروب، خيانة، وبطولة في واحدة من أعظم الملاحم التاريخية.', year: '2026', rating: '9.2', genres: ['دراما', 'أكشن', 'تاريخي'] };

export default function NetflixPage() {
  const [activeGenre, setActiveGenre] = useState('الكل');
  const setSelectedMovie = useSelectedMovie((s) => s.set);

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero Section */}
      <div className="relative h-[75vh] md:h-[85vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#141414] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(229,9,20,0.15) 0%, transparent 60%)' }} />

        {/* Animated background shimmer */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] animate-pulse" style={{ background: '#E50914', animationDuration: '5s' }} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-0.5 text-xs font-semibold bg-[#E50914] text-white rounded">الأكثر مشاهدة</span>
              <span className="text-sm text-zinc-400">{heroMovie.year}</span>
              <span className="flex items-center gap-1 text-sm text-yellow-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>{heroMovie.rating}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight">{heroMovie.title}</h1>
            <p className="text-zinc-300 max-w-2xl mb-6 text-lg leading-relaxed">{heroMovie.desc}</p>
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {heroMovie.genres.map((g) => (
                <span key={g} className="px-4 py-1 text-sm rounded-full bg-white/10 text-zinc-300 border border-white/5">{g}</span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all hover:shadow-xl hover:shadow-white/10 flex items-center gap-2 text-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                تشغيل
              </button>
              <button className="px-8 py-3 bg-zinc-500/30 text-white font-semibold rounded-xl hover:bg-zinc-500/50 transition-all backdrop-blur-sm border border-white/10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                معلومات
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="relative z-20 -mt-16 mb-6 px-8 md:px-16">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeGenre === g ? 'bg-[#E50914] text-white shadow-lg shadow-red-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* Content Rows */}
      <div className="relative space-y-8 pb-16 px-8 md:px-16">
        {rows.map((row) => (
          <motion.section key={row.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">{row.title}</h2>
              <button className="text-sm text-zinc-500 hover:text-white transition-colors">عرض الكل</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
              {row.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[180px] md:w-[200px]" onClick={() => setSelectedMovie(movie.tmdbId || null)}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 mb-2 transition-all duration-300 group-hover:ring-2 group-hover:ring-[#E50914] group-hover:shadow-xl group-hover:shadow-red-500/10">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                      </div>
                      {/* Rating badge */}
                      <div className="absolute top-2 left-2 z-20">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-black/60 text-yellow-500 backdrop-blur-sm">{movie.rating}</span>
                      </div>
                      {/* Year badge */}
                      <div className="absolute top-2 right-2 z-20">
                        <span className="px-2 py-0.5 text-xs rounded bg-black/60 text-zinc-300 backdrop-blur-sm">{movie.year}</span>
                      </div>
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <div className="w-14 h-14 rounded-full bg-[#E50914] flex items-center justify-center shadow-xl shadow-red-500/30">
                          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors truncate">{movie.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
