import type {
  AgeAnimeSummary,
  AgeCatalogItem,
  AgeDetailData,
  AgePagedResult,
  AgeRankBoard,
  AgeUpdateGroup,
  AgedmHomeData,
} from '@/types/agedm'

export type AgedmDataSource = 'live' | 'stale' | 'fallback'

export interface AgedmMeta {
  source: AgedmDataSource
  fetchedAt: string
}

export interface AgedmEnvelope<T> {
  data: T
  meta: AgedmMeta
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

function encodeQuery(params: AgedmCatalogParams): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === 'all') continue
    query.set(key, String(value))
  }
  const serialized = query.toString()
  return serialized ? '?' + serialized : ''
}

/**
 * 纯数据访问层：只负责请求 BFF 并返回 envelope，失败即抛错。
 * 降级策略（pending 占位 / 失败兜底）统一坐在 use-agedm 的 seam 后面。
 */
export function getAgedmHome(signal?: AbortSignal) {
  return requestEnvelope<AgedmHomeData>('/home', signal)
}

export function getAgedmCatalog(params: AgedmCatalogParams, signal?: AbortSignal) {
  return requestEnvelope<AgedmCatalogData>('/catalog' + encodeQuery(params), signal)
}

export function getAgedmUpdate(page = 1, size = 24, signal?: AbortSignal) {
  return requestEnvelope<AgedmUpdateData>('/update?page=' + page + '&size=' + size, signal)
}

export function getAgedmRank(year = 'all', signal?: AbortSignal) {
  return requestEnvelope<AgedmRankData>('/rank?year=' + encodeURIComponent(year), signal)
}

export function getAgedmDetail(id: number, signal?: AbortSignal) {
  return requestEnvelope<AgeDetailData>('/detail/' + id, signal)
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
): Promise<AgePagedResult<AgeAnimeSummary>> {
  const result = await requestEnvelope<AgePagedResult<AgeAnimeSummary>>(
    '/search?query=' + encodeURIComponent(keyword) + '&page=' + page + '&size=' + size,
    signal,
  )
  return result.data
}
