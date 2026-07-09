'use client';
import { useState } from 'react';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'next/navigation';
import { THEMES, ThemeKey } from '@/lib/themes';

const platforms: { key: ThemeKey; label: string; desc: string; color: string }[] = [
  { key: 'netflix', label: 'Netflix', desc: 'أفلام ومسلسلات عالمية', color: '#E50914' },
  { key: 'shahid', label: 'Shahid', desc: 'المحتوى العربي الأصلي', color: '#FF6700' },
  { key: 'disney', label: 'Disney+', desc: 'عالم ديزني السحري', color: '#113CCF' },
  { key: 'crunchyroll', label: 'Crunchyroll', desc: 'الأنمي المترجم', color: '#F47521' },
];

export default function HomePage() {
  const setTheme = useThemeStore((s) => s.setTheme);
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleEnter = (key: ThemeKey) => {
    setTheme(key);
    router.push(`/${key}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          OSAMA/<span className="text-[var(--primary)]">Dev</span>
        </h1>
        <p className="text-zinc-400 text-lg">اختر منصتك المفضلة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => handleEnter(p.key)}
            onMouseEnter={() => setHovered(p.key)}
            onMouseLeave={() => setHovered(null)}
            className="relative group rounded-2xl overflow-hidden h-48 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            style={{ background: `linear-gradient(135deg, ${p.color}22, ${p.color}44)` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at center, ${p.color}33 0%, transparent 70%)`,
              }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: p.color + '33' }}
              >
                <span className="text-2xl font-black text-white">{p.label[0]}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{p.label}</h2>
              <p className="text-sm text-zinc-400">{p.desc}</p>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 group-hover:h-1"
              style={{ backgroundColor: p.color }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
