import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'language-storage' }
  )
);
