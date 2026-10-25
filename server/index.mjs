import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { AGEDM_API_ORIGIN, envelope, fetchUpstream, fromCache, UpstreamError } from './upstream.mjs'
import {
  normalizeCatalog,
  normalizeDetail,
  normalizeHome,
  normalizeRank,
  normalizeSearch,
  normalizeUpdate,
  rawEpisodes,
  sourceKeys,
} from './normalize.mjs'

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = resolve(ROOT_DIR, 'dist')
const API_PREFIX = '/api/agedm'
const BFF_HOST = process.env.BFF_HOST ?? '127.0.0.1'
const BFF_PORT = toInteger(process.env.BFF_PORT, 8787, 1, 65535)
const PLAYER_BASE = 'https://jx.wuzhoupai.com:8443/'
const CATALOG_PARAMS = [
  'region',
  'genre',
  'letter',
  'year',
  'season',
  'status',
  'label',
  'resource',
  'order',
  'page',
  'size',
]

class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

function toInteger(value, fallback, min, max) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) return fallback
  return parsed
}

function parseInteger(value, field, min, max) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new HttpError(400, 'INVALID_' + field.toUpperCase(), field + ' 参数无效')
  }
  return parsed
}

/** 播放 token 是带时间因子的加密串，每次实时解析都会产出不同 URL，
 *  导致前端任何重取都会更换 iframe 地址并重载播放器。因此复用缓存内的原始
 *  详情数据，保证同一集数在缓存窗口内解析结果幂等（与 /detail 路由 TTL 一致）。 */
async function fetchDetailRaw(id) {
  const result = await fromCache('detail-raw:' + id, 300_000, async () =>
    fetchUpstream('detail/' + id),
  )
  return result.data
}

async function getPlayPayload(id, sourceIndex, episodeNumber) {
  const raw = await fetchDetailRaw(id)
  const detail = normalizeDetail(raw)
  const keys = sourceKeys(raw?.video?.playlists)
  const sourceKey = keys[sourceIndex - 1]
  if (!sourceKey) throw new HttpError(404, 'SOURCE_NOT_FOUND', '播放源不存在')

  const episodes = rawEpisodes(raw.video.playlists[sourceKey])
  const current = episodes[episodeNumber - 1]
  if (!current) throw new HttpError(404, 'EPISODE_NOT_FOUND', '分集不存在')

  const vipSources = new Set(
    toText(raw?.player_vip)
      .split(',')
      .map((item) => item.trim()),
  )
  const playerJx = raw?.player_jx && typeof raw.player_jx === 'object' ? raw.player_jx : {}
  const candidateBase = vipSources.has(sourceKey) ? playerJx.vip : playerJx.zj
  if (typeof candidateBase !== 'string' || !candidateBase.startsWith(PLAYER_BASE)) {
    throw new UpstreamError('AGE 播放入口不在允许的播放器范围内')
  }

  return {
    kind: 'iframe',
    iframeUrl: candidateBase + current.token,
    targetUrl: 'https://www.agedm.io/play/' + id + '/' + sourceIndex + '/' + episodeNumber,
    sourceIndex,
    sourceKey,
    sourceLabel: detail.sources.find((source) => source.key === sourceKey)?.label ?? sourceKey,
    sourceIsVip: vipSources.has(sourceKey),
    episode: episodeNumber,
    episodeTitle: current.title,
  }
}

function toText(value, fallback = '') {
  return value === null || value === undefined ? fallback : String(value)
}

function jsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, { ...jsonHeaders(), ...extraHeaders })
  response.end(JSON.stringify(body))
}

function safeError(error) {
  if (error instanceof HttpError) {
    return { status: error.status, code: error.code, message: error.message }
  }
  if (error instanceof UpstreamError) {
    return { status: 502, code: 'UPSTREAM_ERROR', message: 'AGE 实时接口暂时不可用' }
  }
  return { status: 500, code: 'BFF_ERROR', message: 'BFF 服务异常' }
}

function parseCatalogQuery(url) {
  const page = parseInteger(url.searchParams.get('page') ?? '1', 'page', 1, 100_000)
  const size = parseInteger(url.searchParams.get('size') ?? '24', 'size', 1, 100)
  const query = {}
  for (const name of CATALOG_PARAMS) {
    if (name === 'page' || name === 'size') continue
    const value = url.searchParams.get(name)
    if (!value || value === 'all') continue
    query[name] = value
  }
  query.page = page
  query.size = size
  return { page, size, query }
}

function validateYear(value) {
  const year = value ?? 'all'
  if (year === 'all') return year
  parseInteger(year, 'year', 1900, 2100)
  return year
}

async function handleApi(request, response, url) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, jsonHeaders())
    response.end()
    return
  }
  if (request.method !== 'GET') {
    throw new HttpError(405, 'METHOD_NOT_ALLOWED', '仅支持 GET 请求')
  }

  const relativePath = url.pathname.slice(API_PREFIX.length)
  let segments
  try {
    segments = relativePath
      .split('/')
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment))
  } catch {
    throw new HttpError(400, 'INVALID_PATH', '请求路径无效')
  }
  const resource = segments[0]

  if (resource === 'health' && segments.length === 1) {
    sendJson(response, 200, {
      data: { ok: true, service: 'agedm-bff', upstream: AGEDM_API_ORIGIN },
      meta: { source: 'live', fetchedAt: new Date().toISOString() },
    })
    return
  }

  if (resource === 'home' && segments.length === 1) {
    const result = await fromCache('home', 45_000, async () =>
      normalizeHome(await fetchUpstream('home-list')),
    )
    sendJson(response, 200, result)
    return
  }

  if (resource === 'catalog' && segments.length === 1) {
    const { page, size, query } = parseCatalogQuery(url)
    const cacheKey = 'catalog:' + new URLSearchParams(query).toString()
    const result = await fromCache('catalog:' + cacheKey, 45_000, async () =>
      normalizeCatalog(await fetchUpstream('catalog', query), page, size),
    )
    sendJson(response, 200, result)
    return
  }

  if (resource === 'update' && segments.length === 1) {
    const page = parseInteger(url.searchParams.get('page') ?? '1', 'page', 1, 100_000)
    const size = parseInteger(url.searchParams.get('size') ?? '24', 'size', 1, 100)
    const cacheKey = 'update:' + page + ':' + size
    const result = await fromCache(cacheKey, 45_000, async () => {
      const [rawUpdate, rawHome] = await Promise.all([
        fetchUpstream('update', { page, size }),
        fetchUpstream('home-list'),
      ])
      return normalizeUpdate(rawUpdate, rawHome)
    })
    sendJson(response, 200, result)
    return
  }

  if (resource === 'rank' && segments.length === 1) {
    const year = validateYear(url.searchParams.get('year'))
    const result = await fromCache('rank:' + year, 60_000, async () =>
      normalizeRank(await fetchUpstream('rank', { year }), year),
    )
    sendJson(response, 200, result)
    return
  }

  if (resource === 'search' && segments.length === 1) {
    const keyword = (url.searchParams.get('query') ?? '').trim()
    if (!keyword) throw new HttpError(400, 'INVALID_QUERY', '搜索关键词不能为空')
    const page = parseInteger(url.searchParams.get('page') ?? '1', 'page', 1, 100_000)
    const size = parseInteger(url.searchParams.get('size') ?? '24', 'size', 1, 100)
    const cacheKey = 'search:' + keyword + ':' + page + ':' + size
    const result = await fromCache(cacheKey, 45_000, async () =>
      normalizeSearch(await fetchUpstream('search', { query: keyword, page, size })),
    )
    sendJson(response, 200, result)
    return
  }

  if (resource === 'detail' && segments.length === 2) {
    const id = parseInteger(segments[1], 'id', 1, 99_999_999)
    const result = await fromCache('detail:' + id, 300_000, async () =>
      normalizeDetail(await fetchUpstream('detail/' + id)),
    )
    sendJson(response, 200, result)
    return
  }

  if (resource === 'play' && segments.length === 4) {
    const id = parseInteger(segments[1], 'id', 1, 99_999_999)
    const sourceIndex = parseInteger(segments[2], 'source', 1, 20)
    const episodeNumber = parseInteger(segments[3], 'episode', 1, 500)
    const result = await getPlayPayload(id, sourceIndex, episodeNumber)
    sendJson(response, 200, envelope(result, 'live', new Date().toISOString()), {
      'Cache-Control': 'no-store',
    })
    return
  }

  throw new HttpError(404, 'NOT_FOUND', 'BFF 接口不存在')
}

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

async function serveStatic(url, response) {
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    throw new HttpError(400, 'INVALID_PATH', '请求路径无效')
  }

  const relativePath = pathname === '/' ? '/index.html' : pathname
  const candidate = resolve(DIST_DIR, '.' + relativePath)
  const distPrefix = DIST_DIR.endsWith('\\') || DIST_DIR.endsWith('/') ? DIST_DIR : DIST_DIR + '/'
  if (
    candidate !== DIST_DIR &&
    !candidate.startsWith(distPrefix) &&
    !candidate.startsWith(DIST_DIR + '\\')
  ) {
    throw new HttpError(403, 'FORBIDDEN', '禁止访问该路径')
  }

  let filePath = candidate
  try {
    const info = await stat(filePath)
    if (!info.isFile()) throw new Error('not a file')
  } catch {
    if (extname(pathname)) throw new HttpError(404, 'FILE_NOT_FOUND', '文件不存在')
    filePath = join(DIST_DIR, 'index.html')
  }

  try {
    const body = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control':
        extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    response.end(body)
  } catch {
    throw new HttpError(404, 'DIST_NOT_FOUND', '请先构建前端资源')
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  try {
    if (url.pathname === API_PREFIX || url.pathname.startsWith(API_PREFIX + '/')) {
      await handleApi(request, response, url)
    } else {
      await serveStatic(url, response)
    }
  } catch (error) {
    const result = safeError(error)
    if (!response.headersSent) {
      sendJson(response, result.status, {
        error: { code: result.code, message: result.message },
        meta: { source: 'error', fetchedAt: new Date().toISOString() },
      })
    } else {
      response.end()
    }
    if (!(error instanceof HttpError)) {
      console.warn('[agedm-bff]', request.method, url.pathname, result.code)
    }
  }
})

server.listen(BFF_PORT, BFF_HOST, () => {
  console.log('[agedm-bff] listening on http://' + BFF_HOST + ':' + BFF_PORT)
  console.log('[agedm-bff] upstream ' + (process.env.AGEDM_API_ORIGIN ?? 'https://api.agedm.io') + '/v2')
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
