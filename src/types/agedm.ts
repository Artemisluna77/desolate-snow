/**
 * AGE BFF 响应的 wire contract（GLOSSARY）。
 * server 端 normalize* 的输出与 client 端降级快照共享同一组类型；
 * 字段演进时只需联动：本文件 + server normalize + 快照工厂。
 */

export interface AgeCatalogItem {
  id: number
  title: string
  episode: string
  coverUrl?: string
  region: string
  platform: string
  original: string
  other: string
  airDate: string
  status: string
  author: string
  genres: string
  company: string
  summary: string
}

export interface AgeUpdateItem {
  id: number
  title: string
  episode: string
  coverUrl?: string
}

export interface AgeUpdateGroup {
  label: string
  items: AgeUpdateItem[]
}

export interface AgeRankItem {
  id: number
  title: string
  views: string
}

export interface AgeRankBoard {
  title: string
  items: AgeRankItem[]
}

export interface AgeDetailEpisode {
  number: number
  title: string
}

export interface AgeDetailSource {
  key: string
  label: string
  isVip: boolean
  episodes: AgeDetailEpisode[]
}

export interface AgeDetailData {
  id: number
  title: string
  coverUrl: string
  stats: { views: string; comments: string; likes: string }
  region: string
  platform: string
  original: string
  other: string
  author: string
  company: string
  airDate: string
  status: string
  genres: string
  tags: string[]
  website?: string
  summary: string
  related: Array<{ id: number; title: string }>
  recommended: AgeUpdateItem[]
  episodeCount: number
  /** 契约：恒非空。live 来自 BFF normalize，降级来自 getAgeDetail 合成（中性命名「线路 N」）。 */
  sources: AgeDetailSource[]
}

export interface HomeVideoCard {
  id: number
  title: string
  coverUrl: string
  episode: string
}

export interface HomeScheduleItem {
  id: number
  title: string
  episode: string
  isNew?: boolean
  finished?: boolean
}

export interface HomeScheduleDay {
  label: string
  items: HomeScheduleItem[]
}

export interface HomeRecentUpdate {
  id: number
  title: string
  date: string
}

export interface AgedmHomeData {
  latest: HomeVideoCard[]
  recommend: HomeVideoCard[]
  schedule: HomeScheduleDay[]
  recentUpdates: HomeRecentUpdate[]
}

/** 搜索结果条目（原 Bangumi 时代的 AnimeSummary，随 mock/bangumi 链退役并入 AGE 域）。 */
export interface AgeAnimeSummary {
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

export interface AgePagedResult<T> {
  total: number
  items: T[]
}
