'use client';
import { useThemeStore } from '@/stores/theme';
import { THEMES } from '@/lib/themes';

export default function AmbientBackground() {
  const theme = useThemeStore((s) => s.theme);
  const colors = THEMES[theme];
  const hsla = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[128px] animate-pulse"
        style={{ background: hsla(colors.primary, 0.15) }}
      />
      <div
        className="absolute top-1/3 -right-32 w-80 h-80 rounded-full blur-[128px] animate-pulse"
        style={{ background: hsla(colors.accent, 0.1) }}
      />
      <div
        className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full blur-[128px] animate-pulse"
        style={{ background: hsla(colors.primary, 0.08) }}
      />
    </div>
  );
}
