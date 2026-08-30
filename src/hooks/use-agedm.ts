import { useQuery } from '@tanstack/react-query'

import {
  getAgedmCatalog,
  getAgedmDetail,
  getAgedmHome,
  getAgedmPlayback,
  getAgedmRank,
  getAgedmUpdate,
  type AgedmCatalogParams,
} from '@/api/agedm-client'

export function useAgedmHome() {
  return useQuery({
    queryKey: ['agedm-home'],
    queryFn: ({ signal }) => getAgedmHome(signal),
    staleTime: 30_000,
  })
}

export function useAgedmCatalog(params: AgedmCatalogParams) {
  return useQuery({
    queryKey: ['agedm-catalog', params],
    queryFn: ({ signal }) => getAgedmCatalog(params, signal),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function useAgedmUpdate(page = 1, size = 24) {
  return useQuery({
    queryKey: ['agedm-update', page, size],
    queryFn: ({ signal }) => getAgedmUpdate(page, size, signal),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function useAgedmRank(year = 'all') {
  return useQuery({
    queryKey: ['agedm-rank', year],
    queryFn: ({ signal }) => getAgedmRank(year, signal),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  })
}

export function useAgedmDetail(id: number | null) {
  return useQuery({
    queryKey: ['agedm-detail', id],
    queryFn: ({ signal }) => getAgedmDetail(id!, signal),
    enabled: id !== null,
    staleTime: 5 * 60_000,
  })
}

export function useAgedmPlayback(id: number | null, source: number, episode: number) {
  return useQuery({
    queryKey: ['agedm-playback', id, source, episode],
    queryFn: ({ signal }) => getAgedmPlayback(id!, source, episode, signal),
    enabled: id !== null,
    staleTime: 0,
    retry: 1,
  })
}
