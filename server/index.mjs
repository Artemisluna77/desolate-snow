import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = resolve(ROOT_DIR, 'dist')
const API_PREFIX = '/api/agedm'
const AGEDM_API_ORIGIN = process.env.AGEDM_API_ORIGIN ?? 'https://api.agedm.io'
const AGEDM_API_BASE = new URL('/v2/', AGEDM_API_ORIGIN)
const BFF_HOST = process.env.BFF_HOST ?? '127.0.0.1'
const BFF_PORT = toInteger(process.env.BFF_PORT, 8787, 1, 65535)
const UPSTREAM_TIMEOUT_MS = 12_000
const CACHE_LIMIT = 128
const PLAYER_BASE = 'https://jx.wuzhoupai.com:8443/'
const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const SOURCE_ORDER = ['xigua', 'ffm3u8', 'bfzym3u8', 'wjm3u8', 'lzm3u8']
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
const cache = new Map()

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

function toId(value) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function toText(value, fallback = '') {
  return value === null || value === undefined ? fallback : String(value)
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function toCover(id, candidate) {
  if (typeof candidate === 'string' && candidate.trim()) return candidate
  const source = encodeURIComponent('https://cdn.aqdstatic.com:966/age/covers/' + id + '.jpg')
  return 'https://gimg0.baidu.com/gimg/app=2001&n=0&g=0n&fmt=jpeg&src=' + source
}

function mapVideoCard(item) {
  const id = toId(item?.AID ?? item?.id)
  if (!id) return null
  return {
    id,
    title: toText(item?.Title ?? item?.name, '番剧 ' + id),
    coverUrl: toCover(id, item?.PicSmall ?? item?.cover),
    episode: toText(item?.NewTitle ?? item?.uptodate ?? item?.play_time, '全集'),
  }
}

function mapScheduleItem(item) {
  const id = toId(item?.id ?? item?.AID)
  if (!id) return null
  const episode = toText(item?.namefornew ?? item?.NewTitle ?? item?.uptodate, '全集')
  return {
    id,
    title: toText(item?.name ?? item?.Title, '番剧 ' + id),
    episode,
    isNew: item?.isnew === 1 || item?.isnew === '1',
    finished: /完结|已完结/.test(episode),
    updatedAt: toText(item?.mtime),
  }
}

function normalizeHome(raw) {
  const latest = toArray(raw?.latest).map(mapVideoCard).filter(Boolean)
  const recommend = toArray(raw?.recommend).map(mapVideoCard).filter(Boolean)
  const weekList = raw?.week_list && typeof raw.week_list === 'object' ? raw.week_list : {}
  const scheduleRows = new Map()

  for (const rows of Object.values(weekList)) {
    for (const row of toArray(rows)) {
      const mapped = mapScheduleItem(row)
      if (mapped && !scheduleRows.has(mapped.id)) scheduleRows.set(mapped.id, mapped)
    }
  }

  const schedule = WEEK_LABELS.map((label, index) => {
    const sourceDay = String((index + 1) % 7)
    return {
      label,
      items: toArray(weekList[sourceDay])
        .map(mapScheduleItem)
        .filter(Boolean)
        .map(({ updatedAt, ...item }) => item),
    }
  })

  const recentUpdates = latest.map((item) => {
    const scheduleItem = scheduleRows.get(item.id)
    return {
      id: item.id,
      title: item.title,
      date: scheduleItem?.updatedAt ? scheduleItem.updatedAt.slice(0, 10) : item.episode,
    }
  })

  return { latest, recommend, schedule, recentUpdates }
}

function normalizeCatalogItem(item) {
  const id = toId(item?.id ?? item?.AID)
  if (!id) return null
  return {
    id,
    title: toText(item?.name ?? item?.Title, '番剧 ' + id),
    episode: toText(item?.uptodate ?? item?.NewTitle ?? item?.play_time, '全集'),
    coverUrl: toCover(id, item?.cover ?? item?.PicSmall),
    region: toText(item?.area, '暂缺'),
    platform: toText(item?.type, '暂缺'),
    original: toText(item?.name_original, '暂缺'),
    other: toText(item?.name_other, '暂缺'),
    airDate: toText(item?.premiere ?? item?.time_format_2, '暂缺'),
    status: toText(item?.status, '暂缺'),
    author: toText(item?.writer, '暂缺'),
    genres: toText(item?.tags, '暂缺'),
    company: toText(item?.company, '暂缺'),
    summary: toText(item?.intro_clean ?? item?.intro, '暂无简介。'),
  }
}

function normalizeCatalog(raw, page, pageSize) {
  return {
    total: Number(raw?.total) || 0,
    page,
    pageSize,
    items: toArray(raw?.videos).map(normalizeCatalogItem).filter(Boolean),
  }
}

function normalizeUpdateItem(item) {
  const mapped = mapVideoCard(item)
  if (!mapped) return null
  return mapped
}

function updateGroupLabel(dateText) {
  if (!dateText) return '实时更新'
  const date = dateText.slice(0, 10)
  const parsed = new Date(date + 'T12:00:00')
  if (Number.isNaN(parsed.getTime())) return '实时更新'

  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const dayDiff = Math.round((today.getTime() - parsed.getTime()) / 86_400_000)
  const weekdayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  const weekday = weekdayNames[parsed.getDay()]
  if (dayDiff === 0) return '今天 (' + weekday + ')'
  if (dayDiff === 1) return '昨天 (' + weekday + ')'
  if (dayDiff === 2) return '前天 (' + weekday + ')'
  return date + ' (' + weekday + ')'
}

function updateDateMap(homeRaw) {
  const dates = new Map()
  const weekList =
    homeRaw?.week_list && typeof homeRaw.week_list === 'object' ? homeRaw.week_list : {}
  for (const rows of Object.values(weekList)) {
    for (const row of toArray(rows)) {
      const id = toId(row?.id ?? row?.AID)
      const mtime = toText(row?.mtime)
      if (id && mtime) dates.set(id, mtime)
    }
  }
  return dates
}

function normalizeUpdate(raw, homeRaw) {
  const items = toArray(raw?.videos).map(normalizeUpdateItem).filter(Boolean)
  const dates = updateDateMap(homeRaw)
  const groups = new Map()
  for (const item of items) {
    const label = updateGroupLabel(dates.get(item.id))
    const group = groups.get(label) ?? []
    group.push(item)
    groups.set(label, group)
  }
  return {
    total: Number(raw?.total) || 0,
    items,
    groups: Array.from(groups, ([label, groupItems]) => ({ label, items: groupItems })),
  }
}

function normalizeRankItem(item) {
  const id = toId(item?.AID ?? item?.id)
  if (!id) return null
  return {
    id,
    title: toText(item?.Title ?? item?.name, '番剧 ' + id),
    views: toText(item?.CCnt ?? item?.views, '0'),
  }
}

function normalizeRank(raw, year) {
  const boardTitles = ['周榜 TOP50', '月榜 TOP50', '总榜 TOP50']
  const boards = boardTitles.map((title, index) => ({
    title,
    items: toArray(raw?.rank?.[index]).map(normalizeRankItem).filter(Boolean),
  }))
  const count = boards.reduce((total, board) => total + board.items.length, 0)
  return {
    year: toText(raw?.year, year),
    total: Number(raw?.total) || count,
    boards,
    updatedAt: new Date().toISOString(),
  }
}

function mapRelatedItem(item) {
  const id = toId(item?.AID ?? item?.id)
  if (!id) return null
  return {
    id,
    title: toText(item?.Title ?? item?.name, '番剧 ' + id),
  }
}

function mapRecommendedItem(item) {
  const id = toId(item?.AID ?? item?.id)
  if (!id) return null
  return {
    id,
    title: toText(item?.Title ?? item?.name, '番剧 ' + id),
    episode: toText(item?.NewTitle ?? item?.uptodate, '全集'),
    coverUrl: toCover(id, item?.PicSmall ?? item?.cover),
  }
}

function sourceKeys(playlists) {
  if (!playlists || typeof playlists !== 'object') return []
  const keys = Object.keys(playlists)
  return [
    ...SOURCE_ORDER.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !SOURCE_ORDER.includes(key)),
  ]
}

function rawEpisodes(list) {
  return toArray(list)
    .map((item, index) => {
      const title = Array.isArray(item) ? item[0] : (item?.title ?? item?.name)
      const token = Array.isArray(item) ? item[1] : (item?.url ?? item?.token)
      if (typeof token !== 'string' || !token.trim()) return null
      return {
        number: index + 1,
        title: toText(title, '第' + String(index + 1).padStart(2, '0') + '集'),
        token,
      }
    })
    .filter(Boolean)
}

function normalizeDetail(raw) {
  const video = raw?.video
  if (!video || !toId(video.id)) throw new UpstreamError('AGE 详情数据格式异常')

  const labels =
    raw?.player_label_arr && typeof raw.player_label_arr === 'object' ? raw.player_label_arr : {}
  const vipSources = new Set(
    toText(raw?.player_vip)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )
  const playlists = video.playlists && typeof video.playlists === 'object' ? video.playlists : {}
  const sources = sourceKeys(playlists)
    .map((key) => {
      const episodes = rawEpisodes(playlists[key])
      if (episodes.length === 0) return null
      return {
        key,
        label: toText(labels[key], key),
        isVip: vipSources.has(key),
        episodes: episodes.map(({ number, title }) => ({ number, title })),
      }
    })
    .filter(Boolean)
  const episodeCount = sources.reduce((max, source) => Math.max(max, source.episodes.length), 0)
  const tags = Array.isArray(video.tags_arr)
    ? video.tags_arr.map((tag) => String(tag))
    : toText(video.tags).split(/\s+/).filter(Boolean)

  return {
    id: Number(video.id),
    title: toText(video.name, '番剧 ' + video.id),
    coverUrl: toCover(Number(video.id), video.cover),
    stats: {
      views: toText(video.rank_cnt, '0'),
      comments: toText(video.comment_cnt, '0'),
      likes: toText(video.collect_cnt, '0'),
    },
    region: toText(video.area, '暂缺'),
    platform: toText(video.type, '暂缺'),
    original: toText(video.name_original, '暂缺'),
    other: toText(video.name_other, '暂缺'),
    author: toText(video.writer, '暂缺'),
    company: toText(video.company, '暂缺'),
    airDate: toText(video.premiere ?? video.time_format_2, '暂缺'),
    status: toText(video.status, '暂缺'),
    genres: toText(video.tags, '暂缺'),
    tags,
    ...(video.website ? { website: String(video.website) } : {}),
    summary: toText(video.intro_clean ?? video.intro, '暂无简介。'),
    related: toArray(raw?.series).map(mapRelatedItem).filter(Boolean),
    recommended: toArray(raw?.similar).map(mapRecommendedItem).filter(Boolean),
    episodeCount: episodeCount || 1,
    sources,
  }
}

function normalizeSearchItem(item) {
  const mapped = normalizeCatalogItem(item)
  if (!mapped) return null
  const episodeMatch = mapped.episode.match(/\d+/g)
  return {
    id: mapped.id,
    title: mapped.title,
    titleCn: mapped.title,
    coverUrl: mapped.coverUrl,
    rating: null,
    rank: null,
    airDate: mapped.airDate || null,
    episodeCount: episodeMatch ? Number(episodeMatch.at(-1)) : null,
    tags: mapped.genres.split(/\s+/).filter(Boolean),
    platform: mapped.platform || null,
  }
}

function normalizeSearch(raw) {
  const data = raw?.data && typeof raw.data === 'object' ? raw.data : raw
  return {
    total: Number(data?.total) || 0,
    items: toArray(data?.videos).map(normalizeSearchItem).filter(Boolean),
  }
}

class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

class UpstreamError extends Error {
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

async function fetchUpstream(pathname, query) {
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

function envelope(data, source, fetchedAt) {
  return {
    data,
    meta: {
      source,
      fetchedAt,
    },
  }
}

async function fromCache(cacheKey, ttl, loader) {
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

async function getPlayPayload(id, sourceIndex, episodeNumber) {
  const raw = await fetchUpstream('detail/' + id)
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
  console.log('[agedm-bff] upstream ' + AGEDM_API_ORIGIN + '/v2')
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
