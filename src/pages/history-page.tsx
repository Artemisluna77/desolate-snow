import { Link } from 'react-router'

import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { useWatchHistory } from '@/stores/watch-history'
import { usePageTitle } from '@/hooks/use-page-title'

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function HistoryPage() {
  usePageTitle('观看历史')
  const items = useWatchHistory((s) => s.items)
  const remove = useWatchHistory((s) => s.remove)
  const clear = useWatchHistory((s) => s.clear)

  return (
    <div className="container space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          观看历史
          <span className="ml-2 text-sm font-normal text-muted-foreground">{items.length} 条</span>
        </h1>
        {items.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            清空
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState title="暂无观看记录" description="播放过的番剧会出现在这里。" />
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.animeId} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  to={`/detail/${item.animeId}`}
                  className="block truncate text-sm font-medium hover:text-primary"
                >
                  {item.animeTitle}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  看到 第{item.episode}集 · {formatTime(item.watchedAt)}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/play/${item.animeId}/${item.source}/${item.episode}`}>继续播放</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove(item.animeId)}>
                删除
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
