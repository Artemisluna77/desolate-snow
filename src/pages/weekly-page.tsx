import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useWeeklyCalendar } from '@/hooks/use-anime'
import type { AnimeSummary } from '@/types/anime'

function ScheduleList({ animes }: { animes: AnimeSummary[] }) {
  return (
    <ul className="divide-y rounded-lg border">
      {animes.map((anime) => (
        <li key={anime.id}>
          <Link
            to={`/detail/${anime.id}`}
            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50"
          >
            <span className="truncate font-medium">{anime.titleCn ?? anime.title}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {anime.platform ?? ''} {anime.episodeCount ? `· ${anime.episodeCount}集` : ''}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** 一周更新页:七天放送时间表全部展开 */
export function WeeklyPage() {
  const calendar = useWeeklyCalendar()
  const loading = calendar.isPending

  const days: Array<{ weekday: number; label: string; animes: AnimeSummary[] }> = Array.from(
    { length: 7 },
    (_, i) => {
      const entry = calendar.data?.find((s) => s.weekday === i + 1)
      return { weekday: i + 1, label: entry?.weekdayCn ?? `星期${i + 1}`, animes: entry?.animes ?? [] }
    },
  )
  const today = ((new Date().getDay() + 6) % 7) + 1

  return (
    <div className="container space-y-8 py-6">
      <h1 className="text-xl font-semibold">一周更新</h1>
      {calendar.isError ? (
        <p className="text-sm text-muted-foreground">放送数据加载失败,请稍后重试。</p>
      ) : loading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        days.map((day) => (
          <section key={day.weekday}>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-base font-semibold">{day.label}</h2>
              {day.weekday === today ? <Badge>今天</Badge> : null}
              <span className="text-xs text-muted-foreground">{day.animes.length} 部</span>
            </div>
            {day.animes.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                无放送安排
              </p>
            ) : (
              <ScheduleList animes={day.animes} />
            )}
          </section>
        ))
      )}
    </div>
  )
}
