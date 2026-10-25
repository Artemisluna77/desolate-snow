import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BoundedListOptions<TInput, TStored> {
  /** persist key */
  name: string
  /** 条数上限 */
  cap: number
  /** 条目键（去重与删除的依据） */
  keyOf: (item: TStored) => string
  /** 相同键的旧条目移除（默认开）；评论类追加式列表传 false */
  dedupe?: boolean
  /** 写入前装饰（生成 id / 时间戳等）；提供时 add 的入参是装饰前的输入类型 */
  decorate?: (item: TInput) => TStored
}

export interface BoundedListState<TInput, TStored> {
  items: TStored[]
  add: (item: TInput) => void
  remove: (key: string) => void
  clear: () => void
}

/**
 * 有界本地列表惯用法（GLOSSARY）：zustand persist + 条数上限 + 可选去重。
 * cap 与去重策略集中在此，本地 store 只声明差异（候选 8）。
 * TInput ≠ TStored 时（如写入时生成 id/时间戳），add 收装饰前的输入。
 */
export function createBoundedListStore<TInput, TStored = TInput>(
  options: BoundedListOptions<TInput, TStored>,
) {
  const { name, cap, keyOf, dedupe = true, decorate } = options
  return create<BoundedListState<TInput, TStored>>()(
    persist(
      (set) => ({
        items: [] as TStored[],
        add: (item) =>
          set((s) => {
            const next = decorate ? decorate(item) : (item as unknown as TStored)
            const rest = dedupe
              ? s.items.filter((existing) => keyOf(existing) !== keyOf(next))
              : s.items
            return { items: [next, ...rest].slice(0, cap) }
          }),
        remove: (key) =>
          set((s) => ({ items: s.items.filter((existing) => keyOf(existing) !== key) })),
        clear: () => set({ items: [] }),
      }),
      { name },
    ),
  )
}
