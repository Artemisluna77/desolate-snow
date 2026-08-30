import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import { AnimeListItem } from '@/components/anime/anime-list-item'
import { AnimeCardSkeleton } from '@/components/anime/anime-card-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { RetryErrorState } from '@/components/common/error-state'
import { Pagination } from '@/components/ui/pagination'
import { useAnimeSearch } from '@/hooks/use-anime'
import { usePageTitle } from '@/hooks/use-page-title'
import { useSearchHistory } from '@/stores/search-history'

const PAGE_SIZE = 24

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const keyword = params.get('query') ?? params.get('kw') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  usePageTitle(keyword ? `搜索:${keyword}` : '搜索')
  const query = useAnimeSearch(keyword, page, PAGE_SIZE)

  useEffect(() => {
    const kw = keyword.trim()
    if (kw) useSearchHistory.getState().add(kw)
  }, [keyword])

  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="container space-y-6 py-6">
      <h1 className="text-xl font-semibold">
        {keyword ? (
          <>
            「{keyword}」的搜索结果
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              共 {query.data?.total ?? 0} 条
            </span>
          </>
        ) : (
          '搜索'
        )}
      </h1>

      {!keyword.trim() ? (
        <EmptyState title="输入关键词开始搜索" description="支持标题原名与中文名。" />
      ) : query.isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <RetryErrorState onRetry={() => query.refetch()} />
      ) : (query.data?.items.length ?? 0) === 0 ? (
        <EmptyState title="没有找到相关番剧" description="换个关键词试试。" />
      ) : (
        <div className="divide-y rounded-lg border">
          {query.data!.items.map((anime) => (
            <AnimeListItem key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      {keyword ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => setParams({ query: keyword, page: String(p) })}
        />
      ) : null}
    </div>
  )
}
