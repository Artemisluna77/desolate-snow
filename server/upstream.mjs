const AGEDM_API_ORIGIN = process.env.AGEDM_API_ORIGIN ?? 'https://api.agedm.io'
const AGEDM_API_BASE = new URL('/v2/', AGEDM_API_ORIGIN)
const UPSTREAM_TIMEOUT_MS = 12_000
const CACHE_LIMIT = 128
const cache = new Map()

export { AGEDM_API_ORIGIN }

export class UpstreamError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UpstreamError'
    this.code = 'UPSTREAM_ERROR'
  }
}

function upstreamUrl(pathname, query = {}) {
  const url = new URL(pathname, AGEDM_API_BASE)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  return url
}

export async function fetchUpstream(pathname, query) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    const response = await fetch(upstreamUrl(pathname, query), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'desolate-snow/0.1.0 (AGE BFF)',
        Origin: 'https://m.agedm.io',
        Referer: 'https://m.agedm.io/',
      },
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new UpstreamError('AGE 上游返回 HTTP ' + response.status)
    }
    try {
      return await response.json()
    } catch {
      throw new UpstreamError('AGE 上游返回了非 JSON 数据')
    }
  } catch (error) {
    if (error instanceof UpstreamError) throw error
    if (error?.name === 'AbortError') throw new UpstreamError('AGE 上游请求超时')
    throw new UpstreamError('AGE 上游网络请求失败')
  } finally {
    clearTimeout(timeout)
  }
}

export function envelope(data, source, fetchedAt) {
  return {
    data,
    meta: {
      source,
      fetchedAt,
    },
  }
}

/** TTL 缓存 + stale-while-error：上游故障时回吐最近一次成功数据（meta.source = 'stale'）。 */
export async function fromCache(cacheKey, ttl, loader) {
  const now = Date.now()
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return envelope(cached.data, 'live', cached.fetchedAt)
  }

  try {
    const data = await loader()
    const fetchedAt = new Date().toISOString()
    cache.set(cacheKey, { data, expiresAt: Date.now() + ttl, fetchedAt })
    while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value)
    return envelope(data, 'live', fetchedAt)
  } catch (error) {
    if (cached) return envelope(cached.data, 'stale', cached.fetchedAt)
    throw error
  }
}
