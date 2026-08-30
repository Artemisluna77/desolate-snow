import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Star } from 'lucide-react'

import { AnimeCard } from '@/components/anime/anime-card'
import { EmptyState } from '@/components/common/empty-state'
import { RetryErrorState } from '@/components/common/error-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnimeDetail, useAnimeEpisodes } from '@/hooks/use-anime'
import { useCollections } from '@/stores/collections'
import { cn } from '@/lib/utils'
import type { AnimeDetail, Episode } from '@/types/anime'

/** 演示线路:复刻原站多线路选集结构,播放内容由 PlaybackProvider 提供 */
const PLAY_SOURCES = ['线路一', '线路二', '线路三']

const STATUS_LABEL: Record<string, string> = {
  airing: '连载中',
  finished: '已完结',
  upcoming: '未开播',
}

const META_KEYS = ['中文名', '别名', '原作', '制作公司', '动画制作', '官方网站']

function CollectButton({ anime }: { anime: AnimeDetail }) {
  const collected = useCollections((s) => s.items.some((i) => i.animeId === anime.id))
  const toggle = useCollections((s) => s.toggle)
  return (
    <Button
      variant={collected ? 'secondary' : 'outline'}
      size="sm"
      className={cn('h-7', collected && 'text-primary')}
      onClick={() => toggle(anime)}
    >
      <Star className={cn('size-3.5', collected && 'fill-current')} />
      {collected ? '已收藏' : '收藏'}
    </Button>
  )
}

function DetailSkeleton() {
  return (
    <div className="container space-y-6 py-6">
      <Skeleton className="h-8 w-2/3 max-w-lg" />
      <div className="flex gap-6">
        <Skeleton className="aspect-[3/4] w-40 shrink-0 rounded-lg sm:w-48" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  )
}

function EpisodeLinks({ animeId, episodes }: { animeId: string; episodes: Episode[] }) {
  const [source, setSource] = useState(0)
  const main = episodes.filter((e) => e.type === 'main' || e.type === 'other')
  const shown = main.length > 0 ? main : episodes

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="mr-2 text-base">在线播放</CardTitle>
          {PLAY_SOURCES.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setSource(i)}
              aria-pressed={source === i}
              className={cn(
                'rounded-md px-3 py-1 text-xs transition-colors',
                source === i
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">播放异常时可切换线路;当前为演示内容。</p>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无分集数据。</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {shown.map((ep) => (
              <Link
                key={ep.id}
                to={`/play/${animeId}/${source + 1}/${ep.number}`}
                className="rounded-md border px-2 py-1.5 text-center text-xs hover:border-primary hover:text-primary"
              >
                {ep.titleCn ?? `第${ep.number}集`}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DetailPage() {
  const { id } = useParams()
  const animeId = id ? Number(id) : null
  const valid = animeId !== null && Number.isInteger(animeId) && animeId > 0
  const detail = useAnimeDetail(valid ? animeId : null)
  const episodes = useAnimeEpisodes(valid ? animeId : null)

  if (!valid) {
    return <EmptyState title="无效的条目 ID" />
  }
  if (detail.isPending) {
    return <DetailSkeleton />
  }
  if (detail.isError || !detail.data) {
    return <RetryErrorState onRetry={() => detail.refetch()} />
  }

  const anime = detail.data
  const title = anime.titleCn ?? anime.title
  const metaEntries = Object.entries(anime.meta).filter(([key]) => META_KEYS.includes(key))

  return (
    <div className="container space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {anime.titleCn ? <p className="mt-1 text-sm text-muted-foreground">{anime.title}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {anime.rating != null ? (
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{anime.rating.toFixed(1)}</span>
            </span>
          ) : null}
          {anime.rank != null && anime.rank > 0 ? <span>排名 #{anime.rank}</span> : null}
          <Badge variant="secondary">{STATUS_LABEL[anime.status]}</Badge>
          <CollectButton anime={anime} />
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-40 shrink-0 sm:w-48">
          <div className="aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
            {anime.coverUrl ? (
              <img src={anime.coverUrl} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                暂无封面
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {anime.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="min-w-0 flex-1">
          <CardContent className="pt-6">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {metaEntries.map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">{key}</dt>
                  <dd className="min-w-0 break-words">{value}</dd>
                </div>
              ))}
              {anime.platform ? (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">动画种类</dt>
                  <dd>{anime.platform}</dd>
                </div>
              ) : null}
              {anime.airDate ? (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">首播时间</dt>
                  <dd>{anime.airDate}</dd>
                </div>
              ) : null}
              {anime.episodeCount ? (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">话数</dt>
                  <dd>{anime.episodeCount}</dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      </div>

      <EpisodeLinks animeId={String(anime.id)} episodes={episodes.data ?? []} />
      {episodes.isPending ? <Skeleton className="h-32 w-full rounded-lg" /> : null}

      {anime.summary ? (
        <section>
          <h2 className="mb-2 text-base font-semibold">剧情简介</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {anime.summary}
          </p>
        </section>
      ) : null}

      {anime.series.length > 0 ? (
        <section>
          <h2 className="mb-3 text-base font-semibold">系列作品</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {anime.series.slice(0, 12).map((s) => (
              <AnimeCard key={s.id} anime={s} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
