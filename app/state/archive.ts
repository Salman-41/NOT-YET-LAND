import { create } from 'zustand';

type ArchiveState = {
  selectedSlug: string;
  query: string;
  menuOpen: boolean;
  renderer: 'none' | 'terrain' | 'map';
  setSelectedSlug: (slug: string) => void;
  setQuery: (query: string) => void;
  setMenuOpen: (open: boolean) => void;
  setRenderer: (renderer: ArchiveState['renderer']) => void;
};

// Transient UI state only: no localStorage, personal data, or server dependency.
export const useArchiveStore = create<ArchiveState>(set => ({
  selectedSlug: 'kilauea', query: '', menuOpen: false, renderer: 'none',
  setSelectedSlug: selectedSlug => set({ selectedSlug }),
  setQuery: query => set({ query }),
  setMenuOpen: menuOpen => set({ menuOpen }),
  setRenderer: renderer => set({ renderer }),
}));
