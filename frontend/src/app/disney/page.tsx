'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const studios = [
  { name: 'Disney', color: '#113CCF', movies: Array.from({ length: 8 }, (_, i) => ({ id: `disney-${i}`, title: ['Frozen', 'Moana', 'Encanto', 'Zootopia', 'Lion King', 'Aladdin'][i % 6], year: '2025', image: '/placeholder.svg' })) },
  { name: 'Pixar', color: '#FF6B00', movies: Array.from({ length: 8 }, (_, i) => ({ id: `pixar-${i}`, title: ['Inside Out', 'Soul', 'Coco', 'Elemental', 'Toy Story', 'Luca'][i % 6], year: '2025', image: '/placeholder.svg' })) },
  { name: 'DreamWorks', color: '#00A651', movies: Array.from({ length: 8 }, (_, i) => ({ id: `dream-${i}`, title: ['Shrek', 'Kung Fu Panda', 'How to Train Your Dragon', 'Madagascar'][i % 4], year: '2024', image: '/placeholder.svg' })) },
  { name: 'Marvel', color: '#ED1D24', movies: Array.from({ length: 8 }, (_, i) => ({ id: `marvel-${i}`, title: ['Avengers', 'Spider-Man', 'Black Panther', 'Doctor Strange'][i % 4], year: '2026', image: '/placeholder.svg' })) },
  { name: 'Star Wars', color: '#000000', movies: Array.from({ length: 6 }, (_, i) => ({ id: `starwars-${i}`, title: ['The Mandalorian', 'Obi-Wan', 'Ahsoka', 'Andor'][i % 4], year: '2025', image: '/placeholder.svg' })) },
];

export default function DisneyPage() {
  const [activeStudio, setActiveStudio] = useState('الكل');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #000B1A 0%, #001940 100%)' }}>
      <div className="relative h-[65vh] md:h-[75vh] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(17,60,207,0.15) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000B1A] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000B1A]/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="px-3 py-0.5 text-xs font-semibold rounded bg-blue-600 text-white">Pixar</span>
            <h1 className="text-5xl md:text-7xl font-black text-white mt-3 mb-3">Inside Out 2</h1>
            <p className="text-zinc-300 max-w-xl mb-6 text-lg">عواطف جديدة تنضم إلى رأس رايلي في مغامرة شيقة وممتعة</p>
            <div className="flex items-center gap-2 mb-6">
              {['عائلي', 'كوميديا', 'مغامرة'].map((g) => (
                <span key={g} className="px-4 py-1 text-sm rounded-full bg-white/5 text-zinc-300 border border-white/5">{g}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>تشغيل</button>
              <button className="px-8 py-3 bg-white/5 text-white rounded-xl border border-white/10 font-semibold hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>معلومات</button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Studio Filter */}
      <div className="relative -mt-16 mb-6 px-8 md:px-16 z-20">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['الكل', ...studios.map((s) => s.name)].map((name) => (
            <button key={name} onClick={() => setActiveStudio(name)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeStudio === name ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >{name}</button>
          ))}
        </div>
      </div>

      <div className="space-y-10 pb-16 px-8 md:px-16">
        {studios.map((studio) => (
          <motion.section key={studio.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: studio.color }}>{studio.name[0]}</div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{studio.name}</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {studio.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[180px] md:w-[200px]">
                  <div className="group cursor-pointer">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2 transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-500">
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded text-white" style={{ background: studio.color }}>{studio.name}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40">
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
