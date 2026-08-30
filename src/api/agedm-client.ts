import {
  AGE_CATALOG_ITEMS,
  AGE_CATALOG_TOTAL,
  AGE_RANK_BOARDS,
  AGE_UPDATE_GROUPS,
  getAgeDetail,
  type AgeCatalogItem,
  type AgeDetailData,
  type AgeRankBoard,
  type AgeUpdateGroup,
} from '@/data/age-page-data'
import {
  HOME_RECENT,
  HOME_RECENT_UPDATES,
  HOME_RECOMMEND,
  HOME_SCHEDULE,
  type HomeRecentUpdate,
  type HomeScheduleDay,
  type HomeVideoCard,
} from '@/data/home-data'
import type { AnimeSummary, PagedResult } from '@/types/anime'

export type AgedmDataSource = 'live' | 'stale' | 'fallback'

export interface AgedmMeta {
  source: AgedmDataSource
  fetchedAt: string
}

export interface AgedmEnvelope<T> {
  data: T
  meta: AgedmMeta
}

export interface AgedmHomeData {
  latest: HomeVideoCard[]
  recommend: HomeVideoCard[]
  schedule: HomeScheduleDay[]
  recentUpdates: HomeRecentUpdate[]
}

export interface AgedmCatalogData {
  total: number
  page: number
  pageSize: number
  items: AgeCatalogItem[]
}

export interface AgedmUpdateData {
  total: number
  items: Array<{
    id: number
    title: string
    coverUrl?: string
    episode: string
  }>
  groups: AgeUpdateGroup[]
}

export interface AgedmRankData {
  year: string
  total: number
  boards: AgeRankBoard[]
  updatedAt: string
}

export interface AgedmPlayback {
  kind: 'iframe'
  iframeUrl: string
  targetUrl: string
  sourceIndex: number
  sourceKey: string
  sourceLabel: string
  sourceIsVip: boolean
  episode: number
  episodeTitle: string
}

export interface AgedmCatalogParams {
  region?: string
  genre?: string
  letter?: string
  year?: string
  season?: string
  status?: string
  label?: string
  resource?: string
  order?: string
  page?: number
  size?: number
}

const API_PREFIX = '/api/agedm'

async function requestEnvelope<T>(path: string, signal?: AbortSignal): Promise<AgedmEnvelope<T>> {
  const response = await fetch(API_PREFIX + path, {
    headers: { Accept: 'application/json' },
    signal,
  })
  const payload = (await response.json().catch(() => null)) as {
    data?: T
    meta?: AgedmMeta
    error?: { message?: string }
  } | null
  if (!response.ok || !payload?.data || !payload.meta) {
    throw new Error(payload?.error?.message ?? 'AGE BFF 请求失败（' + response.status + '）')
  }
  return payload as AgedmEnvelope<T>
}

async function withFallback<T>(
  path: string,
  fallback: T,
  signal?: AbortSignal,
): Promise<AgedmEnvelope<T>> {
  try {
    return await requestEnvelope<T>(path, signal)
  } catch (error) {
    console.warn('[agedm-client] ' + path + ' 请求失败，使用本地兜底数据', error)
    return {
      data: fallback,
      meta: { source: 'fallback', fetchedAt: new Date().toISOString() },
    }
  }
}

function encodeQuery(params: AgedmCatalogParams): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === 'all') continue
    query.set(key, String(value))
  }
  const serialized = query.toString()
  return serialized ? '?' + serialized : ''
}

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
  updatedAt: new Date().toISOString(),
}

export function getAgedmHome(signal?: AbortSignal) {
  return withFallback<AgedmHomeData>('/home', FALLBACK_HOME, signal)
}

export function getAgedmCatalog(params: AgedmCatalogParams, signal?: AbortSignal) {
  return withFallback<AgedmCatalogData>(
    '/catalog' + encodeQuery(params),
    { ...FALLBACK_CATALOG, page: params.page ?? 1, pageSize: params.size ?? 24 },
    signal,
  )
}

export function getAgedmUpdate(page = 1, size = 24, signal?: AbortSignal) {
  return withFallback<AgedmUpdateData>(
    '/update?page=' + page + '&size=' + size,
    FALLBACK_UPDATE,
    signal,
  )
}

export function getAgedmRank(year = 'all', signal?: AbortSignal) {
  return withFallback<AgedmRankData>(
    '/rank?year=' + encodeURIComponent(year),
    { ...FALLBACK_RANK, year },
    signal,
  )
}

export function getAgedmDetail(id: number, signal?: AbortSignal) {
  return withFallback<AgeDetailData>('/detail/' + id, getAgeDetail(id), signal)
}

export function getAgedmPlayback(
  id: number,
  source: number,
  episode: number,
  signal?: AbortSignal,
) {
  return requestEnvelope<AgedmPlayback>('/play/' + id + '/' + source + '/' + episode, signal)
}

export async function searchAgedm(
  keyword: string,
  page = 1,
  size = 24,
  signal?: AbortSignal,
): Promise<PagedResult<AnimeSummary>> {
  const result = await requestEnvelope<PagedResult<AnimeSummary>>(
    '/search?query=' + encodeURIComponent(keyword) + '&page=' + page + '&size=' + size,
    signal,
  )
  return result.data
}
