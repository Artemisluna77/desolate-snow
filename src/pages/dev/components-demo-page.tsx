import { useState } from 'react'

import { AnimeCard } from '@/components/anime/anime-card'
import { AnimeCardSkeleton } from '@/components/anime/anime-card-skeleton'
import { FilterGroup, type FilterOption } from '@/components/anime/filter-group'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState, RetryErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { mockAnimes } from '@/api/mock-source'

const SORT_OPTIONS: FilterOption[] = [
  { value: 'time', label: '按时间' },
  { value: 'hot', label: '按热度' },
  { value: 'rank', label: '按评分' },
]

const REGION_OPTIONS: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'jp', label: '日本' },
  { value: 'cn', label: '中国' },
  { value: 'us', label: '欧美' },
]

export function ComponentsDemoPage() {
  const [sort, setSort] = useState('time')
  const [region, setRegion] = useState('all')
  const [page, setPage] = useState(3)

  return (
    <div className="container space-y-12 py-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">AnimeCard</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {mockAnimes.slice(0, 6).map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">加载骨架</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-4 w-64" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">筛选组</h2>
        <div className="space-y-3 rounded-lg border p-4">
          <FilterGroup
            label="排序"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(v) => setSort(v === sort ? 'time' : v)}
          />
          <FilterGroup
            label="地区"
            options={REGION_OPTIONS}
            value={region}
            onChange={(v) => setRegion(v === region ? 'all' : v)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">分页</h2>
        <Pagination page={page} totalPages={23} onChange={setPage} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">空态与错误态</h2>
        <div className="rounded-lg border">
          <EmptyState title="暂无数据" description="换个条件试试。" />
        </div>
        <div className="rounded-lg border">
          <ErrorState />
        </div>
        <div className="rounded-lg border">
          <RetryErrorState onRetry={() => {}} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">按钮</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>默认</Button>
          <Button variant="secondary">次要</Button>
          <Button variant="outline">描边</Button>
          <Button variant="ghost">幽灵</Button>
          <Button variant="destructive">危险</Button>
          <Button variant="link">链接</Button>
          <Button disabled>禁用</Button>
        </div>
      </section>
    </div>
  )
}
