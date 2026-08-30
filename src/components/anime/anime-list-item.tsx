import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AnimeSummary } from '@/types/anime'

interface AnimeListItemProps {
  anime: AnimeSummary
  className?: string
}

/** 目录页横向列表条目,布局对照原站(封面 + 元信息 + 简介 + 操作) */
export function AnimeListItem({ anime, className }: AnimeListItemProps) {
  const title = anime.titleCn ?? anime.title
  return (
    <div className={cn('flex gap-4 p-4', className)}>
      <Link to={`/detail/${anime.id}`} className="w-24 shrink-0 sm:w-28">
        <div className="aspect-[3/4] overflow-hidden rounded-md border bg-muted">
          {anime.coverUrl ? (
            <img
              src={anime.coverUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              暂无封面
            </div>
          )}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/detail/${anime.id}`} className="hover:text-primary">
          <h3 className="truncate font-medium">{title}</h3>
        </Link>
        {anime.titleCn ? (
          <p className="truncate text-xs text-muted-foreground">{anime.title}</p>
        ) : null}
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {anime.platform ? <span>{anime.platform}</span> : null}
          {anime.airDate ? <span>首播 {anime.airDate}</span> : null}
          {anime.episodeCount ? <span>{anime.episodeCount} 集</span> : null}
          {anime.rating != null ? <span>评分 {anime.rating.toFixed(1)}</span> : null}
        </p>
        {anime.tags.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {anime.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex gap-3 text-xs">
          <Link to={`/detail/${anime.id}`} className="text-primary hover:underline">
            资源详情
          </Link>
          <Link
            to={`/play/${anime.id}/1/1`}
            className="text-muted-foreground hover:text-primary"
          >
            在线播放
          </Link>
        </div>
      </div>
    </div>
  )
}
