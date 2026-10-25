import { createBoundedListStore } from '@/stores/bounded-list'

/** 搜索历史：按关键词去重，上限 10 条。 */
export const useSearchHistory = createBoundedListStore<string>({
  name: 'search-history',
  cap: 10,
  keyOf: (keyword) => keyword,
})
