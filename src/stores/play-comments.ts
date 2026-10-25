import { createBoundedListStore } from '@/stores/bounded-list'

export interface PlayComment {
  id: string
  animeId: number
  animeTitle: string
  content: string
  createdAt: number
}

/**
 * AGE 官方评论区依赖其账号体系，无法直接对齐；
 * 这里沿用本项目「本地收藏/观看历史」的本地化思路：评论保存在本机浏览器。
 * 追加式列表（不去重），上限 200 条，写入时生成 id 与时间戳。
 */
export const usePlayComments = createBoundedListStore<
  Omit<PlayComment, 'id' | 'createdAt'>,
  PlayComment
>({
  name: 'play-comments',
  cap: 200,
  keyOf: (comment) => comment.id,
  dedupe: false,
  decorate: (comment) => ({
    ...comment,
    id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()),
    createdAt: Date.now(),
  }),
})
