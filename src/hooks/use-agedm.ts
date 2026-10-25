import { useQuery } from '@tanstack/react-query'

import {
  getAgedmCatalog,
  getAgedmDetail,
  getAgedmHome,
  getAgedmPlayback,
  getAgedmRank,
  getAgedmUpdate,
  searchAgedm,
  type AgedmCatalogData,
  type AgedmCatalogParams,
  type AgedmEnvelope,
  type AgedmMeta,
  type AgedmRankData,
  type AgedmUpdateData,
} from '@/api/agedm-client'
import {
  AGE_CATALOG_ITEMS,
  AGE_CATALOG_TOTAL,
  AGE_RANK_BOARDS,
  AGE_UPDATE_GROUPS,
  getAgeDetail,
} from '@/data/age-page-data'
import {
  HOME_RECENT,
  HOME_RECENT_UPDATES,
  HOME_RECOMMEND,
  HOME_SCHEDULE,
} from '@/data/home-data'
import type { AgeDetailData, AgedmHomeData } from '@/types/agedm'

/** 降级快照常量：全站仅此一处（GLOSSARY「降级快照」），页面不得直接引用。 */
const FALLBACK_HOME: AgedmHomeData = {
  latest: HOME_RECENT,
  recommend: HOME_RECOMMEND,
  schedule: HOME_SCHEDULE,
  recentUpdates: HOME_RECENT_UPDATES,
}
const FALLBACK_CATALOG: AgedmCatalogData = {
  total: AGE_CATALOG_TOTAL,
  page: 1,
  pageSize: 24,
  items: AGE_CATALOG_ITEMS,
}
const FALLBACK_UPDATE: AgedmUpdateData = {
  total: AGE_CATALOG_TOTAL,
  items: AGE_UPDATE_GROUPS.flatMap((group) => group.items),
  groups: AGE_UPDATE_GROUPS,
}
const FALLBACK_RANK: AgedmRankData = {
  year: 'all',
  total: AGE_RANK_BOARDS.reduce((total, board) => total + board.items.length, 0),
  boards: AGE_RANK_BOARDS,
  updatedAt: '',
}

function fallbackEnvelope<T>(data: T): AgedmEnvelope<T> {
  return { data, meta: { source: 'fallback', fetchedAt: new Date(0).toISOString() } }
}

/**
 * 数据访问 seam（GLOSSARY「降级快照」）：包装「pending 占位快照 / 失败兜底 / 溯源信号」三件事，
 * 页面只消费 { data, meta, isDegraded }，不再知道 envelope 解包、常量位置与触发条件。
 * playback 与 search 不走此包装——「不兜底」是该 seam 的显式选项。
 */
interface AgedmQueryOptions<T> {
  key: unknown[]
  fetch: (signal: AbortSignal) => Promise<AgedmEnvelope<T>>
  fallback: T
  enabled?: boolean
  staleTime?: number
  /** 翻页场景：请求期间保留上一页数据 */
  keepPrevious?: boolean
}

interface AgedmQuery<T> {
  data: T
  meta: AgedmMeta
  isDegraded: boolean
  refetch: () => void
}

function useAgedmQuery<T>(options: AgedmQueryOptions<T>): AgedmQuery<T> {
  const query = useQuery({
    queryKey: options.key,
    queryFn: async ({ signal }) => {
      try {
        return await options.fetch(signal)
      } catch (error) {
        console.warn('[use-agedm] ' + options.key.join('/') + ' 请求失败，使用本地快照', error)
        return fallbackEnvelope(options.fallback)
      }
    },
    enabled: options.enabled,
    staleTime: options.staleTime,
    placeholderData: (previous) =>
      (options.keepPrevious ? previous : undefined) ?? fallbackEnvelope(options.fallback),
  })
  return {
    data: query.data?.data ?? options.fallback,
    meta: query.data?.meta ?? fallbackEnvelope(options.fallback).meta,
    isDegraded: !query.isPlaceholderData && query.data?.meta.source !== 'live',
    refetch: () => {
      void query.refetch()
    },
  }
}

export function useAgedmHome() {
  return useAgedmQuery<AgedmHomeData>({
    key: ['agedm-home'],
    fetch: (signal) => getAgedmHome(signal),
    fallback: FALLBACK_HOME,
    staleTime: 30_000,
  })
}

export function useAgedmCatalog(params: AgedmCatalogParams) {
  return useAgedmQuery<AgedmCatalogData>({
    key: ['agedm-catalog', params],
    fetch: (signal) => getAgedmCatalog(params, signal),
    fallback: {
      ...FALLBACK_CATALOG,
      page: params.page ?? 1,
      pageSize: params.size ?? 24,
    },
    staleTime: 30_000,
    keepPrevious: true,
  })
}

export function useAgedmUpdate(page = 1, size = 24) {
  return useAgedmQuery<AgedmUpdateData>({
    key: ['agedm-update', page, size],
    fetch: (signal) => getAgedmUpdate(page, size, signal),
    fallback: FALLBACK_UPDATE,
    staleTime: 30_000,
    keepPrevious: true,
  })
}

export function useAgedmRank(year = 'all') {
  return useAgedmQuery<AgedmRankData>({
    key: ['agedm-rank', year],
    fetch: (signal) => getAgedmRank(year, signal),
    fallback: { ...FALLBACK_RANK, year },
    staleTime: 60_000,
  })
}

export function useAgedmDetail(id: number | null) {
  return useAgedmQuery<AgeDetailData>({
    key: ['agedm-detail', id],
    fetch: (signal) => getAgedmDetail(id!, signal),
    fallback: getAgeDetail(id ?? 0),
    enabled: id !== null,
    staleTime: 5 * 60_000,
  })
}

/** 播放地址不兜底（GLOSSARY「播放会话」）：失败即错误态，页面提示切换线路。 */
export function useAgedmPlayback(id: number | null, source: number, episode: number) {
  return useQuery({
    queryKey: ['agedm-playback', id, source, episode],
    queryFn: ({ signal }) => getAgedmPlayback(id!, source, episode, signal),
    enabled: id !== null,
    staleTime: 0,
    retry: 1,
    // 播放地址里的 token 每次解析都不同，任何 refetch 都会更换 iframe src 导致播放器重载。
    // 因此播放会话存活期内不自动换源，重新进入播放页时才重新解析。
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/** 搜索不兜底：失败进入错误态，由页面展示重试。 */
export function useAgedmSearch(keyword: string, page = 1, size = 24) {
  return useQuery({
    queryKey: ['agedm-search', keyword, page, size],
    queryFn: ({ signal }) => searchAgedm(keyword, page, size, signal),
    enabled: keyword.trim().length > 0,
  })
}
