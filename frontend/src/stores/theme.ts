import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEMES, ThemeKey } from '@/lib/themes';

interface ThemeState {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'netflix',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);
