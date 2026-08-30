import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { AnimeCard } from '@/components/anime/anime-card'
import { AnimeCardSkeleton } from '@/components/anime/anime-card-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useWeeklyCalendar } from '@/hooks/use-anime'
import { cn } from '@/lib/utils'
import type { WeeklySchedule } from '@/types/anime'

/** JS getDay()(0=周日)→ Bangumi weekday id(1=周一 … 7=周日) */
function todayWeekday(): number {
  return ((new Date().getDay() + 6) % 7) + 1
}

function SectionTitle({ title, hint, more }: { title: string; hint?: string; more?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {more}
    </div>
  )
}

/** 顶部「今日放送」:纯文本列表,样式对照原站最近更新区 */
function TodayUpdateSection({
  schedule,
  weekday,
  loading,
}: {
  schedule: WeeklySchedule[] | undefined
  weekday: number
  loading: boolean
}) {
  const today = schedule?.find((s) => s.weekday === weekday)
  return (
    <section>
      <SectionTitle title="今日放送" hint={today?.weekdayCn} />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full max-w-md" />
          ))}
        </div>
      ) : !today || today.animes.length === 0 ? (
        <p className="text-sm text-muted-foreground">今天没有放送安排。</p>
      ) : (
        <ul className="divide-y text-sm">
          {today.animes.slice(0, 10).map((anime) => (
            <li key={anime.id}>
              <Link
                to={`/detail/${anime.id}`}
                className="flex items-center gap-2 py-1.5 hover:text-primary"
              >
                <Badge variant="outline" className="shrink-0">
                  {anime.platform ?? '动画'}
                </Badge>
                <span className="truncate">{anime.titleCn ?? anime.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 今日推荐:本周在播条目中评分最高者(数据源无全局推荐接口,取放送表池排序) */
function RecommendSection({
  schedule,
  loading,
}: {
  schedule: WeeklySchedule[] | undefined
  loading: boolean
}) {
  const items = useMemo(() => {
    const pool = schedule?.flatMap((s) => s.animes) ?? []
    return [...pool]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12)
  }, [schedule])

  return (
    <section>
      <SectionTitle title="今日推荐" hint="在播高分" />
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="暂无推荐数据" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </section>
  )
}

/** 本周放送表:星期切换 + 列表 */
function WeeklyTableSection({
  schedule,
  loading,
}: {
  schedule: WeeklySchedule[] | undefined
  loading: boolean
}) {
  const [selected, setSelected] = useState(todayWeekday)
  const current = schedule?.find((s) => s.weekday === selected)

  return (
    <section>
      <SectionTitle title="本周放送" />
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="选择星期">
        {(schedule ?? Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, animes: [], weekdayCn: '' }))).map(
          (s) => (
            <button
              key={s.weekday}
              type="button"
              role="tab"
              aria-selected={s.weekday === selected}
              onClick={() => setSelected(s.weekday)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                s.weekday === selected
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                s.weekday === todayWeekday() && s.weekday !== selected && 'font-medium text-foreground',
              )}
            >
              {s.weekdayCn}
            </button>
          ),
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !current || current.animes.length === 0 ? (
        <EmptyState title="该日暂无放送" />
      ) : (
        <ul className="divide-y rounded-lg border">
          {current.animes.map((anime) => (
            <li key={anime.id}>
              <Link
                to={`/detail/${anime.id}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50"
              >
                {anime.airDate && isNew(anime.airDate) ? (
                  <Badge className="shrink-0 bg-red-500 hover:bg-red-500">New!</Badge>
                ) : null}
                <span className="truncate font-medium">{anime.titleCn ?? anime.title}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {anime.platform ?? ''} {anime.episodeCount ? `· ${anime.episodeCount}集` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 近两周内首播视为新番 */
function isNew(airDate: string): boolean {
  const diff = Date.now() - new Date(airDate).getTime()
  return diff >= 0 && diff < 14 * 24 * 60 * 60 * 1000
}

/** 近期开播:按首播日期倒序,对照原站底部带日期的最近更新 */
function RecentAiringSection({ schedule }: { schedule: WeeklySchedule[] | undefined }) {
  const items = useMemo(() => {
    const pool = schedule?.flatMap((s) => s.animes) ?? []
    return [...pool]
      .filter((a) => a.airDate)
      .sort((a, b) => (b.airDate ?? '').localeCompare(a.airDate ?? ''))
      .slice(0, 10)
  }, [schedule])

  return (
    <section>
      <SectionTitle title="近期开播" hint="按首播日期" />
      <ul className="divide-y rounded-lg border text-sm">
        {items.map((anime) => (
          <li key={anime.id}>
            <Link
              to={`/detail/${anime.id}`}
              className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50"
            >
              <span className="shrink-0 tabular-nums text-muted-foreground">{anime.airDate}</span>
              <span className="truncate">{anime.titleCn ?? anime.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HomePage() {
  const calendar = useWeeklyCalendar()

  return (
    <div className="container space-y-10 py-6">
      <TodayUpdateSection
        schedule={calendar.data}
        weekday={todayWeekday()}
        loading={calendar.isPending}
      />
      <RecommendSection schedule={calendar.data} loading={calendar.isPending} />
      <WeeklyTableSection schedule={calendar.data} loading={calendar.isPending} />
      <RecentAiringSection schedule={calendar.data} />
    </div>
  )
}
