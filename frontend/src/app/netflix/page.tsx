'use client';
import { useState } from 'react';

interface Movie {
  id: string;
  title: string;
  year: string;
  rating: string;
  image: string;
  category: string;
}

const rows: { title: string; movies: Movie[] }[] = [
  {
    title: 'الأكثر مشاهدة',
    movies: Array.from({ length: 10 }, (_, i) => ({
      id: `trending-${i}`,
      title: ['The Last Kingdom', 'Stranger Things', 'Money Heist', 'The Crown', 'Wednesday'][i % 5] + ` ${i + 1}`,
      year: ['2023', '2024', '2025', '2026'][i % 4],
      rating: '8.' + (i + 1),
      image: `/placeholder.svg`,
      category: 'foreign',
    })),
  },
  {
    title: 'أفلام جديدة',
    movies: Array.from({ length: 8 }, (_, i) => ({
      id: `new-${i}`,
      title: ['The Witcher', 'Dark', 'Squid Game', 'Breaking Bad'][i % 4] + ` ${i + 1}`,
      year: '2026',
      rating: '9.' + i,
      image: `/placeholder.svg`,
      category: 'foreign',
    })),
  },
];

export default function NetflixPage() {
  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="relative h-[60vh] md:h-[70vh] bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">The Last Kingdom</h1>
          <p className="text-zinc-400 max-w-xl mb-4">مغامرات ملحمية في عالم الفايكنج والإمبراطوريات القديمة</p>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-white text-black font-semibold rounded hover:bg-white/90 transition flex items-center gap-2">
              ▶ تشغيل
            </button>
            <button className="px-6 py-2 bg-zinc-500/30 text-white rounded hover:bg-zinc-500/50 transition backdrop-blur-sm border border-white/10">
              معلومات
            </button>
          </div>
        </div>
      </div>

      <div className="relative -mt-32 space-y-8 pb-16 px-8 md:px-16">
        {rows.map((row) => (
          <section key={row.title}>
            <h2 className="text-xl font-semibold text-white mb-4">{row.title}</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {row.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-44 group cursor-pointer">
                  <div className="aspect-[2/3] bg-zinc-800 rounded overflow-hidden relative group-hover:ring-2 ring-red-600 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div>
                        <p className="text-white font-medium text-sm">{movie.title}</p>
                        <p className="text-zinc-400 text-xs">{movie.year}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <button className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 hover:bg-red-700 transition">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
      </div>
    </div>
  );
}
