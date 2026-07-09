'use client';
import { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'next/navigation';
import { ThemeKey, themes } from '@/lib/themes';
import { IntroVideo } from '@/components/ui/IntroVideo';

const platforms: { key: ThemeKey; label: string; desc: string; titleAr: string }[] = [
  { key: 'netflix', label: 'Netflix', desc: 'أفلام ومسلسلات عالمية عالية الجودة', titleAr: 'العالمية' },
  { key: 'shahid', label: 'Shahid', desc: 'أضخم مكتبة عربية وتركية مدبلجة', titleAr: 'العربية' },
  { key: 'disney', label: 'Disney+', desc: 'عالم ديزني السحري لجميع أفراد العائلة', titleAr: 'العائلية' },
  { key: 'crunchyroll', label: 'Crunchyroll', desc: 'الأنمي الحصري المترجم فوراً', titleAr: 'الأنمي' },
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleEnter = (key: ThemeKey) => {
    setTheme(key);
    if (key === 'crunchyroll') { setConfirmCrunchy(true); return; }
    setIntro(key);
  };

  const handleIntroComplete = () => {
    const key = intro;
    setIntro(null);
    if (key) router.push(`/${key}`);
  };

  const themeColors = [
    { key: 'netflix', color: '#E50914', from: '#E50914', to: '#b20710' },
    { key: 'shahid', color: '#FF6700', from: '#FF6700', to: '#cc5200' },
    { key: 'disney', color: '#113CCF', from: '#113CCF', to: '#0d2fa3' },
    { key: 'crunchyroll', color: '#F47521', from: '#F47521', to: '#d45e0f' },
  ];

  return (
    <>
      {intro && <IntroVideo src={introVideos[intro]} onComplete={handleIntroComplete} skipText="تخطي" />}

      {confirmCrunchy && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900/90 rounded-3xl p-8 max-w-sm w-full border border-orange-500/20 text-center shadow-2xl shadow-orange-500/10">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎬</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Crunchyroll</h2>
            <p className="text-zinc-400 mb-6">سيتم تحويلك إلى منصة الأنمي. هل أنت مستعد؟</p>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmCrunchy(false); setIntro('crunchyroll'); }} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all">موافق</button>
              <button onClick={() => setConfirmCrunchy(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] animate-pulse" style={{ background: 'radial-gradient(circle, #E50914 0%, transparent 70%)', animationDuration: '4s' }} />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full opacity-15 blur-[120px] animate-pulse" style={{ background: 'radial-gradient(circle, #113CCF 0%, transparent 70%)', animationDuration: '6s' }} />
          <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full opacity-15 blur-[120px] animate-pulse" style={{ background: 'radial-gradient(circle, #FF6700 0%, transparent 70%)', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-10 blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #F47521 0%, transparent 70%)', animationDuration: '7s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Mouse-follow glow */}
        <div className="absolute pointer-events-none transition-all duration-500 ease-out" style={{ width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,9,20,0.08) 0%, transparent 70%)', left: mousePos.x - 150, top: mousePos.y - 150 }} />

        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 relative z-10">
          <div className="inline-block mb-4">
            <span className="text-xs font-medium tracking-[0.3em] text-zinc-500 uppercase">Streaming Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-3 tracking-tight">
            OSAMA/<span className="bg-gradient-to-r from-[var(--primary,#E50914)] via-purple-500 to-blue-500 bg-clip-text text-transparent">Dev</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">اختر منصتك المفضلة واستمتع بأحدث الأفلام والمسلسلات والأنمي</p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl relative z-10">
          {platforms.map((p) => {
            const tc = themeColors.find((t) => t.key === p.key)!;
            return (
              <button
                key={p.key}
                onClick={() => handleEnter(p.key)}
                className="group relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 focus:outline-none"
              >
                {/* Card background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black border border-white/5 group-hover:border-white/20 transition-colors duration-500 rounded-3xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" style={{ background: `linear-gradient(135deg, ${tc.from}22, ${tc.to}11)` }} />

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-56 md:h-64 p-6">
                  {/* Icon circle */}
                  <div className="relative mb-5">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: `linear-gradient(135deg, ${tc.from}33, ${tc.to}22)`, boxShadow: `0 0 30px ${tc.from}22` }}>
                      <span className="text-3xl md:text-4xl font-black text-white">{p.label[0]}</span>
                    </div>
                    <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{ background: `linear-gradient(135deg, ${tc.from}44, ${tc.to}33)` }} />
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{p.label}</h2>
                  <p className="text-sm text-zinc-400 text-center leading-relaxed">{p.desc}</p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-[10%] right-[10%] h-0.5 rounded-full transition-all duration-500 group-hover:h-1 group-hover:left-[5%] group-hover:right-[5%]" style={{ background: `linear-gradient(90deg, transparent, ${tc.from}, transparent)` }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="mt-12 md:mt-16 flex items-center gap-8 md:gap-12 text-center relative z-10">
          {[
            { num: '٨٠+', label: 'موقع بث' },
            { num: '٤', label: 'منصات' },
            { num: '١٠٠٠+', label: 'فيلم ومسلسل' },
            { num: 'مجاناً', label: 'دائماً' },
          ].map((s) => (
            <div key={s.label} className="group cursor-default">
              <div className="text-2xl md:text-3xl font-black text-white mb-1 transition-colors duration-300" style={{ color: 'var(--primary, #E50914)' }}>{s.num}</div>
              <div className="text-xs md:text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center relative z-10">
          <p className="text-zinc-600 text-xs">© 2026 OSAMA/Dev — منصتك المتكاملة للمشاهدة</p>
        </div>
      </div>
    </>
  );
}
