import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  toggle: (id: string) => void;
  isWished: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (id) => set((state) => ({
        items: state.items.includes(id) ? state.items.filter(i => i !== id) : [...state.items, id]
      })),
      isWished: (id) => get().items.includes(id),
    }),
    { name: 'wishlist-storage' }
  )
);
