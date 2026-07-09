'use client';

interface Series {
  id: string;
  title: string;
  type: 'مسلسل' | 'فيلم';
  badge?: 'مترجم' | 'مدبلج' | 'حصري';
  image: string;
}

const arabicSeries: Series[] = Array.from({ length: 10 }, (_, i) => ({
  id: `arabic-${i}`,
  title: ['الاختيار', 'باب الحارة', 'الهيبة', 'الزند', 'أولاد الشمس'][i % 5],
  type: 'مسلسل',
  badge: (['مترجم', 'مدبلج', 'حصري'] as const)[i % 3],
  image: `/placeholder.svg`,
}));

const turkishSeries: Series[] = Array.from({ length: 8 }, (_, i) => ({
  id: `turkish-${i}`,
  title: ['قيامة أرطغرل', 'المؤسس عثمان', 'وداعا يا باريس', 'حب أعمى'][i % 4],
  type: 'مسلسل',
  badge: 'مدبلج',
  image: `/placeholder.svg`,
}));

export default function ShahidPage() {
  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <div className="bg-gradient-to-b from-[#FF6700]/20 via-[#1A1A2E] to-[#1A1A2E] pt-12 pb-8 px-6">
        <h1 className="text-4xl font-bold gold-text">شاهد</h1>
        <p className="text-zinc-400 mt-2">أفلام ومسلسلات عربية وتركية</p>
        <div className="flex gap-2 mt-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {['الكل', 'مسلسلات', 'أفلام', 'رمضان', 'حصريات'].map((cat) => (
            <button key={cat} className="px-4 py-1.5 rounded-full text-sm bg-white/10 text-white hover:bg-[#FF6700]/30 transition whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <section className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">المحتوى العربي</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {arabicSeries.map((s) => (
            <div key={s.id} className="group cursor-pointer">
              <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative">
                {s.badge && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium z-10 ${
                    s.badge === 'حصري' ? 'bg-[#FF6700] text-white' :
                    s.badge === 'مدبلج' ? 'bg-emerald-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {s.badge}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white font-medium text-sm">{s.title}</p>
                </div>
              </div>
              <p className="text-white text-sm mt-2 truncate">{s.title}</p>
              <p className="text-zinc-500 text-xs">{s.type}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16">
        <h2 className="text-lg font-semibold text-white mb-4">المسلسلات التركية</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {turkishSeries.map((s) => (
            <div key={s.id} className="group cursor-pointer">
              <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative">
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-xs font-medium z-10">مدبلج</span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white font-medium text-sm">{s.title}</p>
                </div>
              </div>
              <p className="text-white text-sm mt-2 truncate">{s.title}</p>
              <p className="text-zinc-500 text-xs">مسلسل</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
