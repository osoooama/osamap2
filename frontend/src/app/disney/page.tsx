'use client';

const studios = [
  {
    name: 'Disney',
    color: '#113CCF',
    items: Array.from({ length: 6 }, (_, i) => ({
      id: `disney-${i}`,
      title: ['The Lion King', 'Frozen', 'Moana', 'Aladdin', 'Cinderella', 'Mulan'][i],
    })),
  },
  {
    name: 'Pixar',
    color: '#4A90D9',
    items: Array.from({ length: 6 }, (_, i) => ({
      id: `pixar-${i}`,
      title: ['Toy Story', 'Finding Nemo', 'Inside Out', 'Up', 'Coco', 'The Incredibles'][i],
    })),
  },
  {
    name: 'DreamWorks',
    color: '#6CB4EE',
    items: Array.from({ length: 5 }, (_, i) => ({
      id: `dream-${i}`,
      title: ['Shrek', 'How to Train Your Dragon', 'Kung Fu Panda', 'Madagascar', 'Croods'][i],
    })),
  },
];

export default function DisneyPage() {
  return (
    <div className="min-h-screen bg-[#0A1B3A]">
      <div className="relative h-[50vh] bg-gradient-to-b from-[#113CCF]/40 via-[#0A1B3A] to-[#0A1B3A]">
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <h1 className="text-5xl font-bold text-white mb-2">Disney+</h1>
          <p className="text-zinc-300 max-w-lg">أفلام ومسلسلات أنيميشن للعائلة</p>
        </div>
      </div>

      <div className="px-8 md:px-16 pb-16 space-y-10">
        {studios.map((studio) => (
          <section key={studio.name}>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: studio.color }} />
              {studio.name}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {studio.items.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-44 group cursor-pointer">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 relative group-hover:border-2 transition-all duration-300" style={{ borderColor: studio.color }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white font-medium text-sm">{item.title}</p>
                    </div>
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-600/30 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{item.title}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
