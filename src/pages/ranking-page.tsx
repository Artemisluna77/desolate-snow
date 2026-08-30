import { useMemo } from 'react'

import { AnimeListItem } from '@/components/anime/anime-list-item'
import { AnimeCardSkeleton } from '@/components/anime/anime-card-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { RetryErrorState } from '@/components/common/error-state'
import { useCatalogQuery } from '@/hooks/use-anime'
import { usePageTitle } from '@/hooks/use-page-title'

const RANK_SIZE = 50

/** 排行榜:热门番剧池(目录浏览默认序)按评分排序,页面明示口径 */
export function RankingPage() {
  usePageTitle('排行榜')
  const query = useCatalogQuery({ sort: 'hot', page: 1, pageSize: 100 })

  const items = useMemo(() => {
    const pool = query.data?.items ?? []
    return [...pool].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, RANK_SIZE)
  }, [query.data])

  return (
    <div className="container space-y-6 py-6">
      <h1 className="text-xl font-semibold">
        排行榜
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          热门番剧 · 按评分
        </span>
      </h1>
      <p className="text-xs text-muted-foreground">
        数据源无全局评分排行接口,本榜基于目录热门池(前 100 部)按评分排序,仅供参考。
      </p>

      {query.isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <RetryErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="暂无排行数据" />
      ) : (
        <ol className="divide-y rounded-lg border">
          {items.map((anime, index) => (
            <li key={anime.id} className="flex items-stretch">
              <span
                className={`flex w-10 shrink-0 items-center justify-center text-sm font-semibold tabular-nums ${
                  index < 3 ? 'text-amber-500' : 'text-muted-foreground'
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <AnimeListItem anime={anime} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
