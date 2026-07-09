'use client';

const genres = [
  {
    name: 'Shonen',
    color: '#F47521',
    items: Array.from({ length: 6 }, (_, i) => ({
      id: `shonen-${i}`,
      title: ['One Piece', 'Naruto', 'Dragon Ball', 'My Hero Academia', 'Demon Slayer', 'Jujutsu Kaisen'][i],
      episodes: Math.floor(Math.random() * 1000 + 24),
      season: 'مستمر',
    })),
  },
  {
    name: 'Seinen',
    color: '#FF8C42',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `seinen-${i}`,
      title: ['Attack on Titan', 'Berserk', 'Vinland Saga', 'Monster'][i],
      episodes: Math.floor(Math.random() * 100 + 24),
      season: i === 0 ? 'مكتمل' : 'مستمر',
    })),
  },
  {
    name: 'Slice of Life',
    color: '#FFB347',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `sol-${i}`,
      title: ['Your Lie in April', 'Clannad', 'Violet Evergarden', 'A Silent Voice'][i],
      episodes: Math.floor(Math.random() * 30 + 12),
      season: 'مكتمل',
    })),
  },
];

export default function CrunchyrollPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="bg-gradient-to-b from-[#F47521]/15 via-[#0B0B0B] to-[#0B0B0B] pt-12 pb-6 px-6">
        <h1 className="text-4xl font-bold text-white">
          Crunchy<span className="text-[#F47521]">roll</span>
        </h1>
        <p className="text-zinc-400 mt-2">أنمي مترجم • مواسم كاملة • حلقات جديدة</p>
        <div className="flex gap-2 mt-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {['الكل', 'مستمر', 'مكتمل', 'شونين', 'سينين', 'رومانسي'].map((tag) => (
            <button key={tag} className="px-4 py-1.5 rounded-full text-sm bg-white/10 text-white hover:bg-[#F47521]/30 transition whitespace-nowrap">
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-16 space-y-10">
        {genres.map((genre) => (
          <section key={genre.name}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: genre.color }} />
              <h2 className="text-xl font-semibold text-white">{genre.name}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {genre.items.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden relative border border-zinc-800 group-hover:border-[#F47521]/50 transition-all duration-300">
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#F47521]/90 text-white text-[10px] font-medium rounded z-10">
                      {item.episodes} حلقة
                    </div>
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium z-10 ${
                      item.season === 'مستمر' ? 'bg-emerald-500/90 text-white' : 'bg-zinc-500/90 text-white'
                    }`}>
                      {item.season}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div>
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        <p className="text-zinc-400 text-xs mt-1">{item.episodes} حلقة</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-[#F47521]/90 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{item.title}</p>
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.season === 'مستمر' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                    {item.season}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
