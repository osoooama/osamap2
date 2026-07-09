export const THEMES = {
  netflix: { primary: '#E50914', bg: '#141414', text: '#FFFFFF', accent: '#B81D24' },
  shahid: { primary: '#FF6700', bg: '#1A1A2E', text: '#FFFFFF', accent: '#FF8C00' },
  disney: { primary: '#113CCF', bg: '#0A1B3A', text: '#FFFFFF', accent: '#4A90D9' },
  crunchyroll: { primary: '#F47521', bg: '#0B0B0B', text: '#FFFFFF', accent: '#FF8C42' }
};

export type ThemeKey = keyof typeof THEMES;
