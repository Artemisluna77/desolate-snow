import { UpstreamError } from './upstream.mjs'

const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const SOURCE_ORDER = ['xigua', 'ffm3u8', 'bfzym3u8', 'wjm3u8', 'lzm3u8']

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

export function normalizeHome(raw) {
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

export function normalizeCatalog(raw, page, pageSize) {
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

export function normalizeUpdate(raw, homeRaw) {
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

export function normalizeRank(raw, year) {
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

export function sourceKeys(playlists) {
  if (!playlists || typeof playlists !== 'object') return []
  const keys = Object.keys(playlists)
  return [
    ...SOURCE_ORDER.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !SOURCE_ORDER.includes(key)),
  ]
}

export function rawEpisodes(list) {
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

export function normalizeDetail(raw) {
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

export function normalizeSearch(raw) {
  const data = raw?.data && typeof raw.data === 'object' ? raw.data : raw
  return {
    total: Number(data?.total) || 0,
    items: toArray(data?.videos).map(normalizeSearchItem).filter(Boolean),
  }
}
