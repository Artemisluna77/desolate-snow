import { createBoundedListStore } from '@/stores/bounded-list'

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

/** 收藏：按番剧 id 去重，上限 200 条（原实现无上限，候选 8 收敛策略漂移）。 */
export const useCollections = createBoundedListStore<CollectionEntry>({
  name: 'collections',
  cap: 200,
  keyOf: (entry) => String(entry.animeId),
})
