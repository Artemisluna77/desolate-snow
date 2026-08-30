import type {
  AnimeDetail,
  AnimeSummary,
  CatalogFilter,
  Episode,
  PagedResult,
  WeeklySchedule,
} from '@/types/anime'

export interface AnimeDataSource {
  search(filter: CatalogFilter): Promise<PagedResult<AnimeSummary>>
  getDetail(id: number): Promise<AnimeDetail>
  getEpisodes(id: number): Promise<Episode[]>
  getWeeklyCalendar(): Promise<WeeklySchedule[]>
}
