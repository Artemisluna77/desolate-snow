import { Link } from 'react-router'

import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { useCollections } from '@/stores/collections'
import { usePageTitle } from '@/hooks/use-page-title'

function CollectionCard({ entry }: { entry: ReturnType<typeof useCollections.getState>['items'][number] }) {
  const remove = useCollections((s) => s.remove)
  const title = entry.titleCn ?? entry.title
  return (
    <div>
      <Link to={`/detail/${entry.animeId}`}>
        <div className="aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
          {entry.coverUrl ? (
            <img src={entry.coverUrl} alt={title} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              暂无封面
            </div>
          )}
        </div>
        <h3 className="mt-2 line-clamp-1 text-sm font-medium">{title}</h3>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 h-7 w-full text-xs text-muted-foreground"
        onClick={() => remove(entry.animeId)}
      >
        取消收藏
      </Button>
    </div>
  )
}

export function CollectionsPage() {
  usePageTitle('我的收藏')
  const items = useCollections((s) => s.items)
  const clear = useCollections((s) => s.clear)

  return (
    <div className="container space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          我的收藏
          <span className="ml-2 text-sm font-normal text-muted-foreground">{items.length} 部</span>
        </h1>
        {items.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            清空
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="还没有收藏"
          description="在番剧详情页点击「收藏」加入这里。"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((entry) => (
            <CollectionCard key={entry.animeId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
