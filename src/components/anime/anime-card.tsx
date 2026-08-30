import { Link } from 'react-router'
import { Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AnimeSummary } from '@/types/anime'

interface AnimeCardProps {
  anime: AnimeSummary
  className?: string
}

export function AnimeCard({ anime, className }: AnimeCardProps) {
  const title = anime.titleCn ?? anime.title
  return (
    <Link to={`/detail/${anime.id}`} className={cn('group block', className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
        {anime.coverUrl ? (
          <img
            src={anime.coverUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
            暂无封面
          </div>
        )}
        {anime.episodeCount ? (
          <Badge variant="secondary" className="absolute right-2 top-2 shadow">
            {anime.episodeCount > 1 ? `${anime.episodeCount}集` : '剧场版'}
          </Badge>
        ) : null}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
        {title}
      </h3>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          {anime.rating != null && (
            <>
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {anime.rating.toFixed(1)}
            </>
          )}
        </span>
        <span>{anime.platform ?? ''}</span>
      </div>
    </Link>
  )
}
