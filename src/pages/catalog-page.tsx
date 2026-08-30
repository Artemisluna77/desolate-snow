import { Link, useLocation } from 'react-router'

import { AGE_CATALOG_ITEMS, AGE_CATALOG_TOTAL, type AgeCatalogItem } from '@/data/age-page-data'
import { ageCover } from '@/data/home-data'
import { useAgedmCatalog } from '@/hooks/use-agedm'
import type { AgedmCatalogParams } from '@/api/agedm-client'
import { usePageTitle } from '@/hooks/use-page-title'

type CatalogKey =
  | 'platform'
  | 'year'
  | 'letter'
  | 'genre'
  | 'resource'
  | 'sort'
  | 'region'
  | 'quarter'
  | 'status'
  | 'page'

interface CatalogState {
  platform: string
  year: string
  letter: string
  genre: string
  resource: string
  sort: string
  page: number
  region: string
  quarter: string
  status: string
}

interface FilterOption {
  value: string
  label: string
}

const DEFAULT_PARTS = ['all', 'all', 'all', 'all', 'all', 'time', '1', 'all', 'all', 'all']

const REGIONS: FilterOption[] = [
  { value: '日本', label: '日本' },
  { value: '中国', label: '中国' },
  { value: '欧美', label: '欧美' },
]

const PLATFORMS: FilterOption[] = [
  { value: 'TV', label: 'TV' },
  { value: '剧场版', label: '剧场版' },
  { value: 'OVA', label: 'OVA' },
]

const LETTERS = 'ABCDEFHIJKLMNOPQRSTUVWXYZ'
  .split('')
  .map((letter) => ({ value: letter, label: letter }))

const YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
  '2014',
  '2013',
  '2012',
  '2011',
  '2010',
  '2009',
  '2008',
  '2007',
  '2006',
  '2005',
  '2004',
  '2003',
  '2002',
  '2001',
  '2000以前',
].map((year) => ({ value: year, label: year }))

const QUARTERS: FilterOption[] = [
  { value: '1', label: '1月' },
  { value: '4', label: '4月' },
  { value: '7', label: '7月' },
  { value: '10', label: '10月' },
]

const STATUSES: FilterOption[] = [
  { value: '连载', label: '连载' },
  { value: '完结', label: '完结' },
  { value: '未播放', label: '未播放' },
]

const GENRES = [
  '搞笑',
  '运动',
  '励志',
  '热血',
  '战斗',
  '竞技',
  '校园',
  '青春',
  '爱情',
  '恋爱',
  '冒险',
  '后宫',
  '百合',
  '治愈',
  '萝莉',
  '魔法',
  '悬疑',
  '推理',
  '奇幻',
  '科幻',
  '游戏',
  '神魔',
  '恐怖',
  '血腥',
  '机战',
  '战争',
  '犯罪',
  '历史',
  '社会',
  '职场',
  '剧情',
  '伪娘',
  '耽美',
  '童年',
  '教育',
  '亲子',
  '真人',
  '歌舞',
  '肉番',
  '美少女',
  '轻小说',
  '吸血鬼',
  '女性向',
  '泡面番',
  '欢乐向',
].map((genre) => ({ value: genre, label: genre }))

const RESOURCES: FilterOption[] = [
  { value: 'BDRIP', label: 'BDRIP' },
  { value: 'AGE-RIP', label: 'AGE-RIP' },
]

const SORTS: FilterOption[] = [
  { value: 'time', label: '时间排序' },
  { value: '点击量', label: '点击量' },
]

function parseCatalogState(pathname: string): CatalogState {
  const raw = pathname.startsWith('/catalog/') ? pathname.slice('/catalog/'.length) : ''
  const parts = raw ? decodeURIComponent(raw).split('-') : DEFAULT_PARTS
  const value = (index: number) => parts[index] ?? DEFAULT_PARTS[index] ?? 'all'
  return {
    platform: value(0),
    year: value(1),
    letter: value(2),
    genre: value(3),
    resource: value(4),
    sort: value(5),
    page: Math.max(1, Number(value(6)) || 1),
    region: value(7),
    quarter: value(8),
    status: value(9),
  }
}

function serializeCatalogState(state: CatalogState, keepFilterTail = false): string {
  const parts = [
    state.platform,
    state.year,
    state.letter,
    state.genre,
    state.resource,
    state.sort,
    String(state.page),
    state.region,
    state.quarter,
    state.status,
  ]
  while (!keepFilterTail && parts.length > 7 && parts.at(-1) === 'all') parts.pop()
  return `/catalog/${parts.join('-')}`
}

function catalogLink(state: CatalogState, key: CatalogKey, value: string): string {
  const nextState = {
    ...state,
    [key]: key === 'page' ? Number(value) : value,
    page: key === 'page' ? Number(value) : 1,
  }
  return serializeCatalogState(nextState, key === 'region' || key === 'quarter' || key === 'status')
}

function FilterRow({
  label,
  state,
  keyName,
  options,
}: {
  label: string
  state: CatalogState
  keyName: CatalogKey
  options: FilterOption[]
}) {
  const current = state[keyName]
  const resetValue = keyName === 'sort' ? 'time' : 'all'
  return (
    <div className="age-catalog-filter-row">
      <div className="age-catalog-filter-label">
        <Link
          to={catalogLink(state, keyName, resetValue)}
          className={`age-catalog-filter-label-link${current === resetValue ? ' is-active' : ''}`}
        >
          {label}
        </Link>
      </div>
      <div className="age-catalog-filter-options">
        {options.map((option) => (
          <Link
            key={option.value}
            to={catalogLink(state, keyName, option.value)}
            className={`age-catalog-filter-option${current === option.value ? ' is-active' : ''}`}
          >
            {option.label}
          </Link>
        ))}
      </div>
      <div className="age-catalog-filter-rule" />
    </div>
  )
}

function CatalogItem({ item }: { item: AgeCatalogItem }) {
  const info = [
    ['动画种类', item.platform],
    ['原版名称', item.original],
    ['其他名称', item.other],
    ['首播时间', item.airDate],
    ['播放状态', item.status],
    ['原作', item.author],
    ['剧情类型', item.genres],
    ['制作公司', item.company],
  ]
  return (
    <article className="age-catalog-item">
      <div className="age-catalog-cover">
        <Link to={`/detail/${item.id}`} title={item.title}>
          <img src={item.coverUrl ?? ageCover(item.id)} alt={item.title} />
          <span>{item.episode}</span>
        </Link>
      </div>
      <div className="age-catalog-body">
        <h2>
          <Link to={`/detail/${item.id}`}>{item.title}</Link>
        </h2>
        <div className="age-catalog-info-grid">
          {info.map(([key, value]) => (
            <div key={key} className="age-catalog-info">
              <span>{key}：</span>
              {value}
            </div>
          ))}
        </div>
        <div className="age-catalog-description">
          <span>简介：</span>
          {item.summary}
        </div>
        <div className="age-catalog-actions">
          <Link to={`/detail/${item.id}`} className="age-catalog-secondary">
            资源详情
          </Link>
          <Link to={`/play/${item.id}/1/1`} className="age-catalog-danger">
            在线播放
          </Link>
        </div>
      </div>
    </article>
  )
}

function CatalogPagination({
  state,
  total,
  totalPages,
}: {
  state: CatalogState
  total: number
  totalPages: number
}) {
  const pages = Array.from({ length: Math.min(9, totalPages) }, (_, index) => index + 1)
  return (
    <nav className="age-catalog-pagination" aria-label="navigation">
      <ul>
        <li className="is-disabled">
          <span>
            共 <strong>{total}</strong> 条记录，当前{' '}
            <strong>
              {state.page}/{totalPages}
            </strong>{' '}
            页
          </span>
        </li>
        <li>
          <Link to={catalogLink(state, 'page', '1')}>首页</Link>
        </li>
        {pages.map((page) => (
          <li key={page} className={page === state.page ? 'is-active' : undefined}>
            <Link to={catalogLink({ ...state, page }, 'page', String(page))}>{page}</Link>
          </li>
        ))}
        <li>
          <Link
            to={catalogLink(
              { ...state, page: Math.min(totalPages, state.page + 1) },
              'page',
              String(Math.min(totalPages, state.page + 1)),
            )}
          >
            下一页
          </Link>
        </li>
        <li>
          <Link to={catalogLink({ ...state, page: totalPages }, 'page', String(totalPages))}>
            尾页
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export function CatalogPage() {
  usePageTitle('全部动漫')
  const { pathname } = useLocation()
  const state = parseCatalogState(pathname)
  const catalogParams: AgedmCatalogParams = {
    region: state.region,
    genre: state.platform,
    letter: state.letter,
    year: state.year === '2000以前' ? '2000' : state.year,
    season: state.quarter,
    status: state.status,
    label: state.genre,
    resource: state.resource === 'AGE-RIP' ? 'AGERIP' : state.resource,
    order: state.sort === '点击量' ? 'hits' : state.sort,
    page: state.page,
    size: 24,
  }
  const catalogQuery = useAgedmCatalog(catalogParams)
  const catalog = catalogQuery.data?.data ?? {
    total: AGE_CATALOG_TOTAL,
    page: state.page,
    pageSize: 24,
    items: AGE_CATALOG_ITEMS,
  }
  const totalPages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize))

  return (
    <div className="age-page-main">
      <div className="age-container">
        <section className="age-page-panel age-catalog-panel">
          <div className="age-catalog-filters">
            <FilterRow label="地区" state={state} keyName="region" options={REGIONS} />
            <FilterRow label="版本" state={state} keyName="platform" options={PLATFORMS} />
            <FilterRow label="首字母" state={state} keyName="letter" options={LETTERS} />
            <FilterRow label="年份" state={state} keyName="year" options={YEARS} />
            <FilterRow label="季度" state={state} keyName="quarter" options={QUARTERS} />
            <FilterRow label="状态" state={state} keyName="status" options={STATUSES} />
            <FilterRow label="类型" state={state} keyName="genre" options={GENRES} />
            <FilterRow label="资源" state={state} keyName="resource" options={RESOURCES} />
            <FilterRow label="时间排序" state={state} keyName="sort" options={[SORTS[1]]} />
          </div>

          <div className="age-catalog-results">
            {catalog.items.map((item) => (
              <CatalogItem key={item.id} item={item} />
            ))}
          </div>
          <CatalogPagination state={state} total={catalog.total} totalPages={totalPages} />
        </section>
      </div>
    </div>
  )
}
