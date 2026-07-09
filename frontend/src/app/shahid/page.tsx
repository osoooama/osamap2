'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const genres = ['الكل', 'دراما', 'أكشن', 'رعب', 'خليجي', 'مصري', 'تركي', 'كوميديا'];
const badges = ['مترجم', 'مدبلج', 'حصري', '+18'];

const rows = [
  { title: 'حصريات رمضان', badge: 'حصري', movies: Array.from({ length: 10 }, (_, i) => ({ id: `ramadan-${i}`, title: ['المداح', 'جعفر العمدة', 'الاختيار', 'موسى'][i % 4], year: '2025', badge: 'حصري', image: '/placeholder.svg' })) },
  { title: 'المسلسلات التركية', badge: 'مدبلج', movies: Array.from({ length: 10 }, (_, i) => ({ id: `turkish-${i}`, title: ['قيامة أرطغرل', 'المؤسس عثمان', 'حريم السلطان', 'السلطان عبد الحميد'][i % 4], year: '2024', badge: 'مدبلج', image: '/placeholder.svg' })) },
  { title: 'أفلام عربية', badge: '', movies: Array.from({ length: 8 }, (_, i) => ({ id: `arab-${i}`, title: ['ولاد رزق', 'الفيل الأزرق', 'الخلية', 'الكويسين'][i % 4], year: '2025', badge: '', image: '/placeholder.svg' })) },
];

export default function ShahidPage() {
  const [activeGenre, setActiveGenre] = useState('الكل');
  const accent = '#B8860B';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0015 0%, #1a0a2e 100%)' }}>
      <div className="relative h-[65vh] md:h-[75vh] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(184,134,11,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0015] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0015]/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="px-3 py-0.5 text-xs font-semibold rounded" style={{ background: accent, color: '#fff' }}>حصري</span>
            <h1 className="text-5xl md:text-7xl font-black text-white mt-3 mb-3">المداح</h1>
            <p className="text-zinc-300 max-w-xl mb-6 text-lg">قصة مثيرة عن عالم الجن والرقي في إطار درامي مشوق</p>
            <div className="flex items-center gap-2 mb-6">
              {['دراما', 'رعب', 'خليجي'].map((g) => (
                <span key={g} className="px-4 py-1 text-sm rounded-full bg-white/5 text-zinc-300 border border-white/5">{g}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="px-8 py-3 rounded-xl text-black font-bold transition-all flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #B8860B, #DAA520)' }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>تشغيل</button>
              <button className="px-8 py-3 bg-white/5 text-white rounded-xl border border-white/10 font-semibold hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>معلومات</button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative -mt-16 mb-6 px-8 md:px-16 z-20">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeGenre === g ? 'text-white shadow-lg' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
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
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2 transition-all duration-300" style={{ boxShadow: activeGenre === row.badge ? `0 0 20px ${accent}22` : 'none' }}>
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                      </div>
                      {movie.badge && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded" style={{ background: movie.badge === 'حصري' ? 'linear-gradient(135deg, #B8860B, #DAA520)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>{movie.badge}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ background: accent }}>
                          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors truncate">{movie.title}</h3>
                    <span className="text-xs text-zinc-500">{movie.year}</span>
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
