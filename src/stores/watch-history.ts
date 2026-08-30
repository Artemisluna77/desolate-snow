import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WatchHistoryEntry {
  animeId: number
  animeTitle: string
  episode: number
  source: number
  watchedAt: number
}

interface WatchHistoryState {
  /** 按番剧维度保留最新一条,watchedAt 倒序 */
  items: WatchHistoryEntry[]
  record: (entry: Omit<WatchHistoryEntry, 'watchedAt'>) => void
  remove: (animeId: number) => void
  clear: () => void
}

const MAX_ITEMS = 50

export const useWatchHistory = create<WatchHistoryState>()(
  persist(
    (set) => ({
      items: [],
      record: (entry) =>
        set((s) => ({
          items: [{ ...entry, watchedAt: Date.now() }, ...s.items.filter((i) => i.animeId !== entry.animeId)].slice(
            0,
            MAX_ITEMS,
          ),
        })),
      remove: (animeId) => set((s) => ({ items: s.items.filter((i) => i.animeId !== animeId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'watch-history' },
  ),
)
