import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Favorite {
  movieId: string;
  tmdbId: number;
  title: string;
  posterPath: string;
  platform: 'netflix' | 'shahid' | 'disney' | 'crunchyroll';
}

interface FavoritesState {
  items: Favorite[];
  toggle: (fav: Favorite) => void;
  isFavorite: (movieId: string, platform: string) => boolean;
  getByPlatform: (platform: string) => Favorite[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (fav) => set((state) => {
        const exists = state.items.some(i => i.movieId === fav.movieId && i.platform === fav.platform);
        return { items: exists ? state.items.filter(i => !(i.movieId === fav.movieId && i.platform === fav.platform)) : [...state.items, fav] };
      }),
      isFavorite: (movieId, platform) => get().items.some(i => i.movieId === movieId && i.platform === platform),
      getByPlatform: (platform) => get().items.filter(i => i.platform === platform),
    }),
    { name: 'favorites-storage' }
  )
);
