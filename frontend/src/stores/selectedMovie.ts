import { create } from 'zustand';

interface SelectedMovieState {
  tmdbId: number | null;
  set: (tmdbId: number | null) => void;
}

export const useSelectedMovie = create<SelectedMovieState>((set) => ({
  tmdbId: null,
  set: (tmdbId) => set({ tmdbId }),
}));
