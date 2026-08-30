import { useQuery } from '@tanstack/react-query'
import { animeDataSource } from '@/api'
import type { CatalogFilter } from '@/types/anime'

export function useCatalogQuery(filter: CatalogFilter) {
  return useQuery({
    queryKey: ['catalog', filter],
    queryFn: () => animeDataSource.search(filter),
    placeholderData: (prev) => prev,
  })
}

export function useAnimeDetail(id: number | null) {
  return useQuery({
    queryKey: ['anime-detail', id],
    queryFn: () => animeDataSource.getDetail(id!),
    enabled: id !== null,
  })
}

export function useAnimeEpisodes(id: number | null) {
  return useQuery({
    queryKey: ['anime-episodes', id],
    queryFn: () => animeDataSource.getEpisodes(id!),
    enabled: id !== null,
  })
}

export function useWeeklyCalendar() {
  return useQuery({
    queryKey: ['weekly-calendar'],
    queryFn: () => animeDataSource.getWeeklyCalendar(),
    staleTime: 30 * 60 * 1000,
  })
}

export function useAnimeSearch(keyword: string, page = 1, pageSize = 24) {
  return useQuery({
    queryKey: ['anime-search', keyword, page, pageSize],
    queryFn: () =>
      animeDataSource.search({ keyword, sort: 'match', page, pageSize }),
    enabled: keyword.trim().length > 0,
  })
}
