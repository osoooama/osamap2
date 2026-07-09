'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const animeGenres = ['الكل', 'Shonen', 'Seinen', 'Slice of Life', 'Isekai', 'Mecha', 'Romance', 'Fantasy'];

const rows = [
  { title: 'أشهر الأنمي هذا الموسم', tag: 'Simulcast', movies: Array.from({ length: 10 }, (_, i) => ({ id: `season-${i}`, title: ['Solo Leveling', 'Attack on Titan', 'Jujutsu Kaisen', 'Demon Slayer', 'One Piece', 'Chainsaw Man'][i % 6], eps: `${12 + i * 3}`, tag: 'Simulcast', image: '/placeholder.svg' })) },
  { title: 'أنمي مدبلج', tag: 'دبلجة', movies: Array.from({ length: 8 }, (_, i) => ({ id: `dub-${i}`, title: ['Naruto', 'Dragon Ball', 'Death Note', 'My Hero Academia', 'Pokémon'][i % 5], eps: 'مكتمل', tag: 'دبلجة', image: '/placeholder.svg' })) },
  { title: 'أفلام أنمي', tag: 'فيلم', movies: Array.from({ length: 8 }, (_, i) => ({ id: `movie-${i}`, title: ['Your Name', 'Spirited Away', 'Demon Slayer Mugen Train', 'Weathering With You'][i % 4], eps: 'فيلم', tag: 'فيلم', image: '/placeholder.svg' })) },
];

export default function CrunchyrollPage() {
  const [activeGenre, setActiveGenre] = useState('الكل');
  const accent = '#F47521';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #1a0f0a 100%)' }}>
      <div className="relative h-[65vh] md:h-[75vh] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(244,117,33,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="px-3 py-0.5 text-xs font-semibold rounded" style={{ background: accent, color: '#fff' }}>Simulcast</span>
            <h1 className="text-5xl md:text-7xl font-black text-white mt-3 mb-3">Solo Leveling</h1>
            <p className="text-zinc-300 max-w-xl mb-6 text-lg">أضعف صياد في العالم يصبح الأقوى بعد أن يستيقظ على قوة غامضة</p>
            <div className="flex items-center gap-2 mb-6">
              {['Shonen', 'Fantasy', 'أكشن'].map((g) => (
                <span key={g} className="px-4 py-1 text-sm rounded-full bg-white/5 text-zinc-300 border border-white/5">{g}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="px-8 py-3 rounded-xl text-white font-bold transition-all flex items-center gap-2 shadow-xl" style={{ background: `linear-gradient(135deg, ${accent}, #d45e0f)` }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>تشغيل</button>
              <button className="px-8 py-3 bg-white/5 text-white rounded-xl border border-white/10 font-semibold hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>معلومات</button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="relative -mt-16 mb-6 px-8 md:px-16 z-20">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {animeGenres.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeGenre === g ? 'text-white shadow-lg' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
              style={activeGenre === g ? { background: accent, boxShadow: `0 0 20px ${accent}33` } : {}}
            >{g}</button>
          ))}
        </div>
      </div>

      <div className="space-y-8 pb-16 px-8 md:px-16">
        {rows.map((row) => (
          <motion.section key={row.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">{row.title}</h2>
              <button className="text-sm text-zinc-500 hover:text-white transition-colors">عرض الكل</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {row.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                  <div className="group cursor-pointer">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2 transition-all duration-300 group-hover:ring-2 group-hover:ring-[#F47521]">
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                      </div>
                      {movie.tag && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded text-white" style={{ background: movie.tag === 'Simulcast' ? '#F47521' : movie.tag === 'دبلجة' ? '#6366f1' : '#10b981' }}>{movie.tag}</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 text-xs rounded bg-black/60 text-zinc-300 backdrop-blur-sm">{movie.eps} {movie.eps === 'فيلم' ? '' : 'حلقة'}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ background: accent }}>
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
