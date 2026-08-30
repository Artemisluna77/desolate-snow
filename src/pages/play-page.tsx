import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { RetryErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnimeDetail, useAnimeEpisodes } from '@/hooks/use-anime'
import { demoPlaybackProvider } from '@/playback/playback-provider'
import { cn } from '@/lib/utils'
import { useWatchHistory } from '@/stores/watch-history'

const SOURCE_COUNT = demoPlaybackProvider.sources.length

export function PlayPage() {
  const { id, source, episode } = useParams()
  const navigate = useNavigate()
  const animeId = id ? Number(id) : null
  const valid = animeId !== null && Number.isInteger(animeId) && animeId > 0
  const sourceIndex = Math.min(Math.max(1, Number(source) || 1), SOURCE_COUNT) - 1
  const episodeNumber = Math.max(1, Number(episode) || 1)

  const detail = useAnimeDetail(valid ? animeId : null)
  const episodes = useAnimeEpisodes(valid ? animeId : null)
  const record = useWatchHistory((s) => s.record)

  const mainEpisodes = useMemo(() => {
    const list = episodes.data ?? []
    const main = list.filter((e) => e.type === 'main' || e.type === 'other')
    return main.length > 0 ? main : list
  }, [episodes.data])

  const current = mainEpisodes.find((e) => e.number === episodeNumber) ?? mainEpisodes[episodeNumber - 1]
  const currentIndex = current ? mainEpisodes.indexOf(current) : -1
  const prev = currentIndex > 0 ? mainEpisodes[currentIndex - 1] : undefined
  const next = currentIndex >= 0 && currentIndex < mainEpisodes.length - 1 ? mainEpisodes[currentIndex + 1] : undefined

  useEffect(() => {
    if (detail.data && current) {
      record({
        animeId: detail.data.id,
        animeTitle: detail.data.titleCn ?? detail.data.title,
        episode: current.number,
        source: sourceIndex + 1,
      })
    }
  }, [detail.data, current, sourceIndex, record])

  if (!valid) {
    return <EmptyState title="无效的播放地址" />
  }
  if (detail.isPending) {
    return (
      <div className="container space-y-4 py-6">
        <Skeleton className="aspect-video w-full max-w-4xl rounded-lg" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    )
  }
  if (detail.isError || !detail.data) {
    return <RetryErrorState onRetry={() => detail.refetch()} />
  }

  const anime = detail.data
  const title = anime.titleCn ?? anime.title
  const playback = demoPlaybackProvider.getSource(sourceIndex, anime.id, episodeNumber)

  function switchTo(episodeNumber: number, sourceIdx = sourceIndex) {
    navigate(`/play/${animeId}/${sourceIdx + 1}/${episodeNumber}`)
  }

  return (
    <div className="container py-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/detail/${animeId}`}>
            <ChevronLeft /> 返回详情
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">
          {title} <span className="text-muted-foreground">第{episodeNumber}集</span>
        </h1>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-lg border bg-black">
            <video
              key={playback.url}
              controls
              className="aspect-video w-full"
              src={playback.url}
              poster={anime.coverUrl ?? undefined}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">线路</span>
            {demoPlaybackProvider.sources.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => switchTo(episodeNumber, i)}
                aria-pressed={i === sourceIndex}
                className={cn(
                  'rounded-md px-3 py-1 text-xs transition-colors',
                  i === sourceIndex
                    ? 'bg-primary font-medium text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!prev}
              onClick={() => prev && switchTo(prev.number)}
            >
              <ChevronLeft /> 上一集
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!next}
              onClick={() => next && switchTo(next.number)}
            >
              下一集 <ChevronRight />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            当前为公共演示视频,仅用于验证播放器交互,不代表番剧正片内容。
          </p>
        </div>

        <aside className="w-full shrink-0 lg:w-64">
          <h2 className="mb-2 text-sm font-medium">选集({mainEpisodes.length})</h2>
          <div className="max-h-[480px] space-y-1 overflow-y-auto rounded-lg border p-2">
            {mainEpisodes.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">暂无分集数据</p>
            ) : (
              mainEpisodes.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => switchTo(ep.number)}
                  aria-current={ep.number === episodeNumber}
                  className={cn(
                    'block w-full truncate rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                    ep.number === episodeNumber
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  {ep.titleCn ?? `第${ep.number}集`}
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
