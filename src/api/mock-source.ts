import type { AnimeDataSource } from './data-source'
import type {
  AnimeDetail,
  AnimeSummary,
  CatalogFilter,
  Episode,
  PagedResult,
  WeeklySchedule,
} from '@/types/anime'

function cover(label: string) {
  return `https://placehold.co/300x400/6366f1/white?text=${encodeURIComponent(label)}`
}

const WEEKDAY_CN = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

interface MockAnime {
  id: number
  title: string
  titleCn: string
  airDate: string
  platform: string
  tags: string[]
  rating: number | null
  episodeCount: number
  summary: string
  weekday: number
}

const MOCK_ANIMES: MockAnime[] = [
  {
    id: 1,
    title: 'Mock Heroines',
    titleCn: '魔法少女重逢录',
    airDate: '2026-07-05',
    platform: 'TV',
    tags: ['魔法少女', '日常', '治愈'],
    rating: 7.9,
    episodeCount: 12,
    summary: '这是 mock 数据源中的演示条目。十年前一起玩耍的伙伴在高中重逢,却发现自己的青梅竹马成了魔法少女……',
    weekday: 1,
  },
  {
    id: 2,
    title: 'Steel Frontier',
    titleCn: '钢铁边境',
    airDate: '2026-04-12',
    platform: 'TV',
    tags: ['科幻', '战斗', '机战'],
    rating: 8.4,
    episodeCount: 24,
    summary: '这是 mock 数据源中的演示条目。殖民卫星独立战争结束三十年后,边境殖民地少年捡到了一台旧时代的高达。',
    weekday: 3,
  },
  {
    id: 3,
    title: 'Cafeteria Diaries',
    titleCn: '食堂物语',
    airDate: '2026-01-10',
    platform: 'TV',
    tags: ['日常', '美食', '搞笑'],
    rating: 7.2,
    episodeCount: 13,
    summary: '这是 mock 数据源中的演示条目。一所普通高中的食堂里,部长与部员们用料理解决一切烦恼。',
    weekday: 5,
  },
  {
    id: 4,
    title: 'Deep Blue Signal',
    titleCn: '深蓝信号',
    airDate: '2026-08-20',
    platform: 'TV',
    tags: ['悬疑', '科幻', '海洋'],
    rating: 8.8,
    episodeCount: 12,
    summary: '这是 mock 数据源中的演示条目。深海观测站收到的一段无法解析的信号,改变了四名研究员的夏天。',
    weekday: 6,
  },
  {
    id: 5,
    title: 'Yuki no Kiseki Movie',
    titleCn: '雪之奇迹 剧场版',
    airDate: '2025-12-20',
    platform: '剧场版',
    tags: ['治愈', '奇幻'],
    rating: 9.1,
    episodeCount: 1,
    summary: '这是 mock 数据源中的演示条目。雪山上的一段旅途,两个女孩与一只会说话的狐狸。',
    weekday: 7,
  },
  {
    id: 6,
    title: 'Sword Chronicles II',
    titleCn: '剑 Chronikle 第二季',
    airDate: '2026-10-02',
    platform: 'TV',
    tags: ['奇幻', '战斗', '冒险'],
    rating: null,
    episodeCount: 12,
    summary: '这是 mock 数据源中的演示条目。未开播条目,用于验证即将放送状态展示。',
    weekday: 2,
  },
]

const MOCK_COVERS = new Map(MOCK_ANIMES.map((a) => [a.id, cover(a.title)]))

function toSummary(a: MockAnime): AnimeSummary {
  return {
    id: a.id,
    title: a.title,
    titleCn: a.titleCn,
    coverUrl: MOCK_COVERS.get(a.id) ?? null,
    rating: a.rating,
    rank: a.rating ? Math.round(1000 - a.rating * 100) : null,
    airDate: a.airDate,
    episodeCount: a.episodeCount,
    tags: a.tags,
    platform: a.platform,
  }
}

function matches(a: MockAnime, filter: CatalogFilter): boolean {
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase()
    const hit =
      a.title.toLowerCase().includes(kw) ||
      a.titleCn.toLowerCase().includes(kw) ||
      a.tags.some((t) => t.toLowerCase().includes(kw))
    if (!hit) return false
  }
  if (filter.year && !a.airDate.startsWith(String(filter.year))) return false
  if (filter.tag && !a.tags.includes(filter.tag)) return false
  if (filter.platform && a.platform !== filter.platform) return false
  return true
}

function sortItems(items: AnimeSummary[], filter: CatalogFilter): AnimeSummary[] {
  const sorted = [...items]
  if (filter.sort === 'rank') sorted.sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0))
  else if (filter.sort === 'hot') sorted.sort((x, y) => (y.rank ?? 0) - (x.rank ?? 0))
  else sorted.sort((x, y) => (y.airDate ?? '').localeCompare(x.airDate ?? ''))
  return sorted
}

export const mockSource: AnimeDataSource = {  async search(filter): Promise<PagedResult<AnimeSummary>> {
    const items = sortItems(
      MOCK_ANIMES.filter((a) => matches(a, filter)).map(toSummary),
      filter,
    )
    const start = (filter.page - 1) * filter.pageSize
    await new Promise((r) => setTimeout(r, 200))
    return { total: items.length, items: items.slice(start, start + filter.pageSize) }
  },

  async getDetail(id): Promise<AnimeDetail> {
    const a = MOCK_ANIMES.find((x) => x.id === id)
    if (!a) throw new Error(`mock 数据源中不存在条目 ${id}`)
    const date = new Date(a.airDate)
    const now = Date.now()
    const status = date.getTime() > now ? 'upcoming' : now - date.getTime() < 182 * 86400000 ? 'airing' : 'finished'
    await new Promise((r) => setTimeout(r, 150))
    return {
      ...toSummary(a),
      summary: a.summary,
      status,
      meta: {
        中文名: a.titleCn,
        别名: a.title,
        动画种类: a.platform,
        原作: 'mock 原作',
        制作公司: 'mock 工作室',
        放送开始: a.airDate,
      },
      series: MOCK_ANIMES.filter((x) => x.id !== a.id && x.titleCn.startsWith(a.titleCn.slice(0, 2)))
        .map(toSummary),
    }
  },

  async getEpisodes(id): Promise<Episode[]> {
    const a = MOCK_ANIMES.find((x) => x.id === id)
    if (!a) return []
    return Array.from({ length: a.episodeCount }, (_, i) => ({
      id: a.id * 1000 + i + 1,
      number: i + 1,
      title: `Episode ${i + 1}`,
      titleCn: `第${i + 1}集`,
      duration: '24m',
      type: 'main' as const,
    }))
  },

  async getWeeklyCalendar(): Promise<WeeklySchedule[]> {
    return WEEKDAY_CN.map((weekdayCn, i) => ({
      weekday: i + 1,
      weekdayCn,
      animes: MOCK_ANIMES.filter((a) => a.weekday === i + 1).map(toSummary),
    }))
  },
}

/** 供组件演示页直接使用的静态条目 */
export const mockAnimes: AnimeSummary[] = MOCK_ANIMES.map(toSummary)
