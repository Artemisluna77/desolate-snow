import { describe, expect, it } from 'vitest'

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

/** 上游原始字段的双命名（AID/id、Title/name、PicSmall/cover）归一防御。 */
describe('normalize：上游字段漂移防御', () => {
  it('normalizeHome：AID/Title/PicSmall 命名映射，week_list 按星期分桶且去掉内部字段', () => {
    const home = normalizeHome({
      latest: [{ AID: 100, Title: '番A', PicSmall: 'https://a/1.jpg', NewTitle: '第02集' }],
      recommend: [{ id: 200, name: '番B', cover: 'https://a/2.jpg' }],
      week_list: {
        '1': [{ id: 100, name: '番A', namefornew: '第03集', isnew: 1, mtime: '2026-09-01 12:00:00' }],
      },
    })
    expect(home.latest[0]).toMatchObject({ id: 100, title: '番A', episode: '第02集' })
    expect(home.recommend[0]).toMatchObject({ id: 200, title: '番B' })
    expect(home.schedule[0].label).toBe('周一')
    expect(home.schedule[0].items[0]).toEqual({
      id: 100,
      title: '番A',
      episode: '第03集',
      isNew: true,
      finished: false,
    })
    // recentUpdates 用 schedule 的 mtime 日期
    expect(home.recentUpdates[0]).toEqual({ id: 100, title: '番A', date: '2026-09-01' })
  })

  it('normalizeHome：缺封面的条目回退到 aqdstatic 封面代理', () => {
    const home = normalizeHome({ latest: [{ AID: 300, Title: '番C' }] })
    expect(home.latest[0].coverUrl).toContain(
      encodeURIComponent('https://cdn.aqdstatic.com:966/age/covers/300.jpg'),
    )
  })

  it('normalizeCatalog：total 透传、无效条目被过滤', () => {
    const catalog = normalizeCatalog(
      { total: 2, videos: [{ id: 1, name: '甲', tags: '战斗 恋爱' }, { AID: 'bad' }] },
      3,
      24,
    )
    expect(catalog.page).toBe(3)
    expect(catalog.pageSize).toBe(24)
    expect(catalog.items).toHaveLength(1)
    expect(catalog.items[0]).toMatchObject({ id: 1, title: '甲', region: '暂缺' })
    expect(catalog.items[0].genres).toBe('战斗 恋爱')
  })

  it('normalizeUpdate：按 mtime 分组为 今天/昨天/前日/日期', () => {
    const today = new Date()
    const fmt = (d) => d.toISOString().slice(0, 10)
    const result = normalizeUpdate(
      { total: 2, videos: [{ AID: 1, Title: '甲' }, { AID: 2, Title: '乙' }] },
      { week_list: { '1': [{ id: 1, mtime: fmt(today) + ' 08:00:00' }] } },
    )
    expect(result.items).toHaveLength(2)
    const todayGroup = result.groups.find((g) => g.label.startsWith('今天'))
    expect(todayGroup?.items.map((i) => i.id)).toEqual([1])
  })

  it('normalizeRank：三列榜单结构与兜底计数', () => {
    const rank = normalizeRank({ rank: [[{ AID: 9, Title: '甲', CCnt: '12' }], [], []] }, '2026')
    expect(rank.year).toBe('2026')
    expect(rank.boards).toHaveLength(3)
    expect(rank.boards[0].items[0]).toMatchObject({ id: 9, views: '12' })
    expect(rank.total).toBe(1)
  })

  it('normalizeSearch：解包 data 包装，条目转为 AgeAnimeSummary 形状', () => {
    const search = normalizeSearch({
      data: { total: 1, videos: [{ AID: 7, Title: '番G', uptodate: '第12集(完结)', type: 'TV', tags: '战斗' }] },
    })
    expect(search.total).toBe(1)
    expect(search.items[0]).toMatchObject({
      id: 7,
      titleCn: '番G',
      episodeCount: 12,
      platform: 'TV',
      rating: null,
    })
  })
})

/** 线路域（GLOSSARY）：SOURCE_ORDER 决定线路顺序，playlists 分集支持数组与对象两种上游形态。 */
describe('normalize：线路域', () => {
  it('sourceKeys：SOURCE_ORDER 优先，其余按出现顺序排在后面', () => {
    expect(sourceKeys({ wjm3u8: [], xigua: [], ffhd: [], ffm3u8: [] })).toEqual([
      'xigua',
      'ffm3u8',
      'wjm3u8',
      'ffhd',
    ])
    expect(sourceKeys(undefined)).toEqual([])
  })

  it('rawEpisodes：数组形态 [title, token] 与对象形态 {title, url} 都能解析，空 token 被过滤', () => {
    expect(rawEpisodes([['第01集', 'tok1'], ['第02集', 'tok2']])).toEqual([
      { number: 1, title: '第01集', token: 'tok1' },
      { number: 2, title: '第02集', token: 'tok2' },
    ])
    expect(rawEpisodes([{ title: '第01集', url: 'tokA' }, { name: 'x' }])).toHaveLength(1)
  })

  it('normalizeDetail：playlists 归一为 sources（label/VIP/分集），stats 与推荐映射', () => {
    const detail = normalizeDetail({
      video: {
        id: 20260066,
        name: '测试番',
        rank_cnt: '1.2w',
        comment_cnt: '34',
        collect_cnt: '56',
        area: '日本',
        type: 'TV',
        tags: '战斗 恋爱',
        playlists: {
          xigua: [['第01集', 'tok1'], ['第02集', 'tok2']],
          ffm3u8: [['第01集', 'tokA']],
        },
      },
      player_label_arr: { xigua: 'VIP 西瓜', ffm3u8: '非凡' },
      player_vip: 'xigua',
      series: [{ AID: 1, Title: '前作' }],
      similar: [{ AID: 2, Title: '相关', NewTitle: '第03集', PicSmall: 'https://c/2.jpg' }],
    })
    expect(detail.sources).toHaveLength(2)
    expect(detail.sources[0]).toMatchObject({ key: 'xigua', label: 'VIP 西瓜', isVip: true })
    expect(detail.sources[0].episodes).toEqual([
      { number: 1, title: '第01集' },
      { number: 2, title: '第02集' },
    ])
    expect(detail.sources[1]).toMatchObject({ key: 'ffm3u8', isVip: false })
    expect(detail.episodeCount).toBe(2)
    expect(detail.stats).toEqual({ views: '1.2w', comments: '34', likes: '56' })
    expect(detail.related[0]).toEqual({ id: 1, title: '前作' })
    expect(detail.recommended[0]).toMatchObject({ id: 2, episode: '第03集' })
  })

  it('normalizeDetail：video 缺失或 id 非法时抛 UpstreamError', () => {
    expect(() => normalizeDetail({})).toThrow()
    expect(() => normalizeDetail({ video: { id: 'x' } })).toThrow()
  })
})
