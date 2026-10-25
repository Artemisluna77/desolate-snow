import { createBoundedListStore } from '@/stores/bounded-list'

export interface WatchHistoryEntry {
  animeId: number
  animeTitle: string
  episode: number
  source: number
  watchedAt: number
}

/** 观看历史：按番剧维度去重（保留最新集数），上限 50 条，watchedAt 倒序。 */
export const useWatchHistory = createBoundedListStore<Omit<WatchHistoryEntry, 'watchedAt'>, WatchHistoryEntry>({
  name: 'watch-history',
  cap: 50,
  keyOf: (entry) => String(entry.animeId),
  decorate: (entry) => ({ ...entry, watchedAt: Date.now() }),
})
