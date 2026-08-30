import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AnimeSummary } from '@/types/anime'

export interface CollectionEntry {
  animeId: number
  title: string
  coverUrl: string | null
  episodeCount: number | null
  rating: number | null
  airDate: string | null
  titleCn: string | null
  addedAt: number
}

interface CollectionsState {
  items: CollectionEntry[]
  has: (animeId: number) => boolean
  toggle: (anime: AnimeSummary) => void
  remove: (animeId: number) => void
  clear: () => void
}

export const useCollections = create<CollectionsState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (animeId) => get().items.some((i) => i.animeId === animeId),
      toggle: (anime) =>
        set((s) =>
          s.items.some((i) => i.animeId === anime.id)
            ? { items: s.items.filter((i) => i.animeId !== anime.id) }
            : {
                items: [
                  {
                    animeId: anime.id,
                    title: anime.title,
                    titleCn: anime.titleCn,
                    coverUrl: anime.coverUrl,
                    episodeCount: anime.episodeCount,
                    rating: anime.rating,
                    airDate: anime.airDate,
                    addedAt: Date.now(),
                  },
                  ...s.items,
                ],
              },
        ),
      remove: (animeId) => set((s) => ({ items: s.items.filter((i) => i.animeId !== animeId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'collections' },
  ),
)
