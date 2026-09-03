import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PlayComment {
  id: string
  animeId: number
  animeTitle: string
  content: string
  createdAt: number
}

interface PlayCommentsState {
  /** createdAt 倒序 */
  items: PlayComment[]
  add: (comment: Omit<PlayComment, 'id' | 'createdAt'>) => void
  remove: (id: string) => void
}

const MAX_ITEMS = 200

/**
 * AGE 官方评论区依赖其账号体系，无法直接对齐；
 * 这里沿用本项目「本地收藏/观看历史」的本地化思路：评论保存在本机浏览器。
 */
export const usePlayComments = create<PlayCommentsState>()(
  persist(
    (set) => ({
      items: [],
      add: (comment) =>
        set((s) => ({
          items: [
            {
              ...comment,
              id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()),
              createdAt: Date.now(),
            },
            ...s.items,
          ].slice(0, MAX_ITEMS),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((item) => item.id !== id) })),
    }),
    { name: 'play-comments' },
  ),
)
