import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { AnimeListItem } from '@/components/anime/anime-list-item'
import { AnimeCardSkeleton } from '@/components/anime/anime-card-skeleton'
import { FilterGroup, type FilterOption } from '@/components/anime/filter-group'
import { EmptyState } from '@/components/common/empty-state'
import { RetryErrorState } from '@/components/common/error-state'
import { Pagination } from '@/components/ui/pagination'
import { useCatalogQuery } from '@/hooks/use-anime'
import { usePageTitle } from '@/hooks/use-page-title'
import type { CatalogFilter, CatalogSort } from '@/types/anime'

const PAGE_SIZE = 24

const REGION_OPTIONS: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: '日本', label: '日本' },
  { value: '中国', label: '中国' },
  { value: '欧美', label: '欧美' },
]

const PLATFORM_OPTIONS: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'TV', label: 'TV' },
  { value: '剧场版', label: '剧场版' },
  { value: 'OVA', label: 'OVA' },
  { value: 'WEB', label: 'WEB' },
]

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'airing', label: '连载' },
  { value: 'finished', label: '完结' },
  { value: 'upcoming', label: '未播放' },
]

const TAG_OPTIONS: FilterOption[] = [
  '热血', '战斗', '恋爱', '校园', '搞笑', '奇幻', '科幻', '悬疑',
  '日常', '治愈', '冒险', '运动', '音乐', '机战', '魔法', '美食',
].map((t) => ({ value: t, label: t }))

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS: FilterOption[] = [
  { value: 'all', label: '全部' },
  ...Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => {
    const y = CURRENT_YEAR - i
    return { value: String(y), label: String(y) }
  }),
]

interface FilterState {
  region: string
  platform: string
  status: string
  year: string
  tag: string
  sort: CatalogSort
  page: number
}

function parseState(params: URLSearchParams): FilterState {
  const sort = params.get('sort')
  return {
    region: params.get('region') ?? 'all',
    platform: params.get('platform') ?? 'all',
    status: params.get('status') ?? 'all',
    year: params.get('year') ?? 'all',
    tag: params.get('tag') ?? 'all',
    sort: sort === 'rank' || sort === 'hot' ? sort : 'hot',
    page: Math.max(1, Number(params.get('page')) || 1),
  }
}

function stateToParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.region !== 'all') params.set('region', state.region)
  if (state.platform !== 'all') params.set('platform', state.platform)
  if (state.status !== 'all') params.set('status', state.status)
  if (state.year !== 'all') params.set('year', state.year)
  if (state.tag !== 'all') params.set('tag', state.tag)
  if (state.sort !== 'hot') params.set('sort', state.sort)
  if (state.page > 1) params.set('page', String(state.page))
  return params
}

export function CatalogPage() {
  usePageTitle('番剧目录')
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(() => parseState(searchParams), [searchParams])

  function update(patch: Partial<FilterState>) {
    const next = { ...state, ...patch, page: patch.page ?? 1 }
    setSearchParams(stateToParams(next))
  }

  const yearFilter = state.year === 'all' ? undefined : Number(state.year)
  const queryFilter: CatalogFilter = {
    year: yearFilter,
    tag: state.tag !== 'all' ? state.tag : undefined,
    sort: state.sort,
    page: state.page,
    pageSize: PAGE_SIZE,
  }
  const query = useCatalogQuery(queryFilter)

  const unsupportedNames = [
    state.tag !== 'all' && '类型',
    state.region !== 'all' && '地区',
    state.platform !== 'all' && '版本',
    state.status !== 'all' && '播出状态',
  ].filter(Boolean) as string[]
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="container space-y-6 py-6">
      <h1 className="text-xl font-semibold">
        番剧目录 <span className="ml-2 text-sm font-normal text-muted-foreground">按人气排序</span>
      </h1>

      <div className="space-y-3 rounded-lg border p-4">
        <FilterGroup
          label="类型"
          options={[{ value: 'all', label: '全部' }, ...TAG_OPTIONS]}
          value={state.tag}
          onChange={(v) => update({ tag: v })}
        />
        <FilterGroup
          label="年份"
          options={YEAR_OPTIONS}
          value={state.year}
          onChange={(v) => update({ year: v })}
        />
        <FilterGroup
          label="地区"
          options={REGION_OPTIONS}
          value={state.region}
          onChange={(v) => update({ region: v })}
        />
        <FilterGroup
          label="版本"
          options={PLATFORM_OPTIONS}
          value={state.platform}
          onChange={(v) => update({ platform: v })}
        />
        <FilterGroup
          label="状态"
          options={STATUS_OPTIONS}
          value={state.status}
          onChange={(v) => update({ status: v })}
        />
      </div>

      {unsupportedNames.length > 0 ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
          「{unsupportedNames.join('、')}」筛选在数据源(Bangumi)中无对应过滤能力,当前结果未按该条件过滤。
        </p>
      ) : null}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {query.isFetching
            ? '加载中…'
            : `共 ${query.data?.total ?? 0} 条记录,当前第 ${state.page}/${totalPages} 页`}
        </span>
      </div>

      {query.isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <RetryErrorState onRetry={() => query.refetch()} />
      ) : (query.data?.items.length ?? 0) === 0 ? (
        <EmptyState title="没有符合条件的番剧" description="换个筛选条件试试。" />
      ) : (
        <div className="divide-y rounded-lg border">
          {query.data!.items.map((anime) => (
            <AnimeListItem key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      <Pagination
        page={state.page}
        totalPages={totalPages}
        onChange={(p) => update({ page: p })}
      />
    </div>
  )
}
