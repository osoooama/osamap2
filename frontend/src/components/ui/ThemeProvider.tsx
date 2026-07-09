'use client';
import { useThemeStore } from '@/stores/theme';
import AmbientBackground from '@/components/ui/AmbientBackground';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  return (
    <div className={`theme-${theme} flex min-h-full flex-col`}>
      <AmbientBackground />
      {children}
    </div>
  );
}
