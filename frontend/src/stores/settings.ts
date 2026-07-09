import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  language: 'ar' | 'en';
  themeMode: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  videoQuality: '720p' | '1080p' | '4K' | 'auto';
  subtitleEnabled: boolean;
  subtitleLanguage: 'ar' | 'en' | 'tr' | 'auto';
  subtitleFontSize: 'small' | 'medium' | 'large';
  subtitleColor: string;
  subtitleBackground: 'transparent' | 'dark' | 'opaque';
  subtitleDelay: number;
  audioLanguage: 'original' | 'dubbed';
  audioVolume: number;
  audioEqualizer: boolean;
  displayMode: 'full' | 'smart' | 'original';
  displayBrightness: number;
  setLanguage: (lang: 'ar' | 'en') => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setVideoQuality: (q: '720p' | '1080p' | '4K' | 'auto') => void;
  toggleSubtitles: () => void;
  setSubtitleLanguage: (lang: 'ar' | 'en' | 'tr' | 'auto') => void;
  setSubtitleFontSize: (size: 'small' | 'medium' | 'large') => void;
  setSubtitleColor: (color: string) => void;
  setSubtitleBackground: (bg: 'transparent' | 'dark' | 'opaque') => void;
  setSubtitleDelay: (delay: number) => void;
  setAudioLanguage: (lang: 'original' | 'dubbed') => void;
  setAudioVolume: (vol: number) => void;
  toggleAudioEqualizer: () => void;
  setDisplayMode: (mode: 'full' | 'smart' | 'original') => void;
  setDisplayBrightness: (brightness: number) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ar',
      themeMode: 'system',
      soundEnabled: true,
      hapticsEnabled: true,
      videoQuality: 'auto',
      subtitleEnabled: true,
      subtitleLanguage: 'ar',
      subtitleFontSize: 'medium',
      subtitleColor: '#FFFFFF',
      subtitleBackground: 'transparent',
      subtitleDelay: 0,
      audioLanguage: 'original',
      audioVolume: 50,
      audioEqualizer: false,
      displayMode: 'smart',
      displayBrightness: 100,
      setLanguage: (language) => set({ language }),
      setThemeMode: (themeMode) => set({ themeMode }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      setVideoQuality: (videoQuality) => set({ videoQuality }),
      toggleSubtitles: () => set((state) => ({ subtitleEnabled: !state.subtitleEnabled })),
      setSubtitleLanguage: (subtitleLanguage) => set({ subtitleLanguage }),
      setSubtitleFontSize: (subtitleFontSize) => set({ subtitleFontSize }),
      setSubtitleColor: (subtitleColor) => set({ subtitleColor }),
      setSubtitleBackground: (subtitleBackground) => set({ subtitleBackground }),
      setSubtitleDelay: (subtitleDelay) => set({ subtitleDelay }),
      setAudioLanguage: (audioLanguage) => set({ audioLanguage }),
      setAudioVolume: (audioVolume) => set({ audioVolume }),
      toggleAudioEqualizer: () => set((state) => ({ audioEqualizer: !state.audioEqualizer })),
      setDisplayMode: (displayMode) => set({ displayMode }),
      setDisplayBrightness: (displayBrightness) => set({ displayBrightness }),
      resetSettings: () => set({
        language: 'ar', themeMode: 'system', soundEnabled: true, hapticsEnabled: true,
        videoQuality: 'auto', subtitleEnabled: true, subtitleLanguage: 'ar',
        subtitleFontSize: 'medium', subtitleColor: '#FFFFFF', subtitleBackground: 'transparent',
        subtitleDelay: 0, audioLanguage: 'original', audioVolume: 50, audioEqualizer: false,
        displayMode: 'smart', displayBrightness: 100
      }),
    }),
    { name: 'settings-storage' }
  )
);
