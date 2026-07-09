'use client';
import { useState } from 'react';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'next/navigation';
import { ThemeKey } from '@/lib/themes';
import { IntroVideo } from '@/components/ui/IntroVideo';

const platforms: { key: ThemeKey; label: string; desc: string; color: string }[] = [
  { key: 'netflix', label: 'Netflix', desc: 'أفلام ومسلسلات عالمية', color: '#E50914' },
  { key: 'shahid', label: 'Shahid', desc: 'المحتوى العربي الأصلي', color: '#FF6700' },
  { key: 'disney', label: 'Disney+', desc: 'عالم ديزني السحري', color: '#113CCF' },
  { key: 'crunchyroll', label: 'Crunchyroll', desc: 'الأنمي المترجم', color: '#F47521' },
];

const introVideos: Record<string, string> = {
  netflix: '/intros/netflix.mp4',
  shahid: '/intros/shahid.mp4',
  disney: '/intros/disney.mp4',
  crunchyroll: '/intros/crunchyroll.mp4',
};

export default function HomePage() {
  const setTheme = useThemeStore((s) => s.setTheme);
  const router = useRouter();
  const [intro, setIntro] = useState<ThemeKey | null>(null);
  const [confirmCrunchy, setConfirmCrunchy] = useState(false);

  const handleEnter = (key: ThemeKey) => {
    setTheme(key);
    if (key === 'crunchyroll') {
      setConfirmCrunchy(true);
      return;
    }
    setIntro(key);
  };

  const handleIntroComplete = () => {
    const key = intro;
    setIntro(null);
    if (key) router.push(`/${key}`);
  };

  return (
    <>
      {intro && (
        <IntroVideo
          src={introVideos[intro]}
          onComplete={handleIntroComplete}
          skipText="تخطي"
        />
      )}

      {confirmCrunchy && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-800 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Crunchyroll</h2>
            <p className="text-zinc-400 mb-6">سيتم تحويلك إلى منصة الأنمي. هل أنت مستعد؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmCrunchy(false); setIntro('crunchyroll'); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F47521] text-white font-medium hover:bg-[#F47521]/90 transition"
              >
                موافق
              </button>
              <button
                onClick={() => setConfirmCrunchy(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
