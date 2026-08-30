export interface AnimeSummary {
  id: number
  title: string
  titleCn: string | null
  coverUrl: string | null
  rating: number | null
  rank: number | null
  airDate: string | null
  episodeCount: number | null
  tags: string[]
  platform: string | null
}

export type AnimeStatus = 'airing' | 'finished' | 'upcoming'

export interface AnimeDetail extends AnimeSummary {
  summary: string
  status: AnimeStatus
  /** infobox 扁平化结果,如 { 中文名, 别名, 原作, 制作公司, 放送开始 } */
  meta: Record<string, string>
  /** 同系列相关条目 */
  series: AnimeSummary[]
}

export type EpisodeType = 'main' | 'sp' | 'op' | 'ed' | 'other'

export interface Episode {
  id: number
  number: number
  title: string
  titleCn: string | null
  duration: string | null
  type: EpisodeType
}

export interface WeeklySchedule {
  /** 1 = 周一 … 7 = 周日 */
  weekday: number
  weekdayCn: string
  animes: AnimeSummary[]
}

export type CatalogSort = 'hot' | 'rank' | 'match'

export interface CatalogFilter {
  keyword?: string
  /** 首播年份 */
  year?: number
  /** 播出季度:1 / 4 / 7 / 10 月 */
  quarter?: 1 | 4 | 7 | 10
  /** 题材标签,如「热血」「校园」 */
  tag?: string
  /** 地区(日本/中国/欧美)— 数据源无对应能力,保留供 UI 标注 */
  region?: string
  /** 版本(TV/剧场版/OVA)— 数据源无对应能力,保留供 UI 标注 */
  platform?: string
  /** 播出状态 — 数据源无对应能力,保留供 UI 标注 */
  status?: AnimeStatus
  /** 首字母 — 数据源无对应能力,保留供 UI 标注 */
  letter?: string
  sort: CatalogSort
  page: number
  pageSize: number
}

export interface PagedResult<T> {
  total: number
  items: T[]
}
