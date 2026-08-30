import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SearchHistoryState {
  items: string[]
  add: (keyword: string) => void
  remove: (keyword: string) => void
  clear: () => void
}

const MAX_ITEMS = 10

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      items: [],
      add: (keyword) =>
        set((s) => ({
          items: [keyword, ...s.items.filter((k) => k !== keyword)].slice(0, MAX_ITEMS),
        })),
      remove: (keyword) => set((s) => ({ items: s.items.filter((k) => k !== keyword) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'search-history' },
  ),
)
