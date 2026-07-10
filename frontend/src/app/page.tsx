import Link from 'next/link';

const platforms = [
  { name: 'Netflix', href: '/netflix', bg: 'bg-netflix', accent: 'text-netflix', border: 'border-netflix', desc: 'أفلام أجنبية' },
  { name: 'Shahid', href: '/shahid', bg: 'bg-shahid', accent: 'text-shahid', border: 'border-shahid', desc: 'عربي + تركي' },
  { name: 'Disney+', href: '/disney', bg: 'bg-disney', accent: 'text-disney', border: 'border-disney', desc: 'أنيميشن' },
  { name: 'Crunchyroll', href: '/crunchyroll', bg: 'bg-crunchyroll', accent: 'text-crunchyroll', border: 'border-crunchyroll', desc: 'أنمي' },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-zinc-950">
      <h1 className="text-4xl font-bold text-white mb-4">OSAMA{`>`}Dev</h1>
      <p className="text-zinc-400 text-lg mb-8">اختر المنصة</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {platforms.map((p) => (
          <Link key={p.name} href={p.href}>
            <div className={`${p.bg} rounded-xl border ${p.border} p-8 text-center hover:scale-105 transition-transform cursor-pointer shadow-lg`}>
              <h2 className={`text-2xl font-bold ${p.accent} mb-2`}>{p.name}</h2>
              <p className="text-zinc-300 text-sm">{p.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
