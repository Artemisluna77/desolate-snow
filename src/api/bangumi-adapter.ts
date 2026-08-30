import type {
  AnimeDataSource,
} from './data-source'
import type { AnimeSummary, CatalogFilter, Episode, PagedResult, WeeklySchedule } from '@/types/anime'
import { bgmFetch } from './bangumi-client'

/** Bangumi v0 条目(详情与搜索结果同构,calendar 条目字段略少,做兼容映射) */
interface BangumiSubject {
  id: number
  name: string
  name_cn?: string | null
  date?: string | null
  air_date?: string | null
  images?: Partial<Record<'large' | 'common' | 'medium' | 'small' | 'grid', string>> | null
  image?: string | null
  summary?: string | null
  platform?: string | null
  eps?: number | null
  total_episodes?: number | null
  tags?: Array<{ name: string; count?: number }> | null
  rating?: { score?: number; rank?: number } | null
  rank?: number | null
  infobox?: Array<{ key: string; value: string | Array<{ v: string }> }> | null
  series?: boolean
}

interface BangumiCalendarEntry {
  weekday: { id: number; cn: string }
  items: BangumiSubject[]
}

const EPISODE_TYPE_MAP: Record<number, Episode['type']> = {
  0: 'main',
  1: 'sp',
  2: 'op',
  3: 'ed',
}

function toAnimeSummary(s: BangumiSubject): AnimeSummary {
  return {
    id: s.id,
    title: s.name,
    titleCn: s.name_cn || null,
    coverUrl:
      s.images?.common ?? s.images?.medium ?? s.images?.large ?? s.image ?? null,
    rating: s.rating?.score ?? null,
    rank: s.rating?.rank ?? s.rank ?? null,
    airDate: s.date ?? s.air_date ?? null,
    episodeCount: s.total_episodes ?? s.eps ?? null,
    tags: (s.tags ?? []).slice(0, 6).map((t) => t.name),
    platform: s.platform ?? null,
  }
}

function flattenInfobox(infobox: NonNullable<BangumiSubject['infobox']>): Record<string, string> {
  const meta: Record<string, string> = {}
  for (const item of infobox) {
    if (typeof item.value === 'string') {
      meta[item.key] = item.value
    } else if (Array.isArray(item.value)) {
      meta[item.key] = item.value.map((v) => v.v).join(' / ')
    }
  }
  return meta
}

/** 首播日期推断播出状态(数据源无直接字段,近似值) */
export function inferStatus(airDate: string | null): 'airing' | 'finished' | 'upcoming' {
  if (!airDate) return 'finished'
  const date = new Date(airDate)
  if (Number.isNaN(date.getTime())) return 'finished'
  const now = Date.now()
  if (date.getTime() > now) return 'upcoming'
  const sixMonths = 182 * 24 * 60 * 60 * 1000
  return now - date.getTime() < sixMonths ? 'airing' : 'finished'
}

function toSearchBody(filter: CatalogFilter) {
  const body: Record<string, unknown> = {
    filter: {
      type: [2],
      ...(filter.year ? { years: [String(filter.year)] } : {}),
      ...(filter.tag ? { tags: [filter.tag] } : {}),
    },
    sort: filter.sort,
    limit: filter.pageSize,
    offset: (filter.page - 1) * filter.pageSize,
  }
  if (filter.keyword) body.keyword = filter.keyword
  return body
}

export const bangumiSource: AnimeDataSource = {
  async search(filter: CatalogFilter): Promise<PagedResult<AnimeSummary>> {
    const res = await bgmFetch<{ total: number; data: BangumiSubject[] }>('/v0/search/subjects', {
      method: 'POST',
      body: JSON.stringify(toSearchBody(filter)),
    })
    return { total: res.total, items: res.data.map(toAnimeSummary) }
  },

  async getDetail(id: number) {
    const s = await bgmFetch<BangumiSubject>(`/v0/subjects/${id}`)
    let series: AnimeSummary[] = []
    try {
      const related = await bgmFetch<BangumiSubject[]>(`/v0/subjects/${id}/subjects`)
      series = related.map(toAnimeSummary)
    } catch {
      // 系列接口失败不阻塞详情展示
    }
    const summary = toAnimeSummary(s)
    return {
      ...summary,
      summary: s.summary ?? '',
      status: inferStatus(summary.airDate),
      meta: flattenInfobox(s.infobox ?? []),
      series,
    }
  },

  async getEpisodes(id: number): Promise<Episode[]> {
    // 部分条目无分集数据,端点返回 404,按空列表处理
    try {
      const res = await bgmFetch<{
        data: Array<{
          id: number
          type: number
          name: string
          name_cn?: string | null
          sort: number
          duration?: string | null
        }>
      }>(`/v0/subjects/${id}/episodes`)
      return res.data.map((e) => ({
        id: e.id,
        number: e.sort,
        title: e.name,
        titleCn: e.name_cn || null,
        duration: e.duration || null,
        type: EPISODE_TYPE_MAP[e.type] ?? 'other',
      }))
    } catch {
      return []
    }
  },

  async getWeeklyCalendar(): Promise<WeeklySchedule[]> {
    const entries = await bgmFetch<BangumiCalendarEntry[]>('/calendar')
    return entries.map((entry) => ({
      weekday: entry.weekday.id,
      weekdayCn: entry.weekday.cn,
      animes: (entry.items ?? []).map(toAnimeSummary),
    }))
  },
}
