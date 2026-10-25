import type { AgeDetailData } from '@/types/agedm'

interface AnimeInfoListProps {
  anime: AgeDetailData
  /** 两页的字段顺序与条目是官方各自的：detail 多一行「标签」，其余顺序亦有差异 */
  variant?: 'detail' | 'play'
}

const LABELS: Record<string, string> = {
  region: '地区',
  platform: '动画种类',
  original: '原版名称',
  other: '其他名称',
  author: '原作',
  company: '制作公司',
  airDate: '首播时间',
  status: '播放状态',
  genres: '剧情类型',
}

const DETAIL_ORDER = ['region', 'platform', 'original', 'other', 'author', 'company', 'airDate', 'status', 'genres']
const PLAY_ORDER = ['region', 'platform', 'original', 'other', 'author', 'status', 'airDate', 'genres', 'company']

/** 番剧元信息字段表（GLOSSARY「番剧展示域」）：官方两页的字段顺序内置在本模块。 */
export function AnimeInfoList({ anime, variant = 'detail' }: AnimeInfoListProps) {
  const entries: Array<[string, string]> = (variant === 'detail' ? DETAIL_ORDER : PLAY_ORDER).map(
    (key) => [LABELS[key], String(anime[key as keyof AgeDetailData] ?? '')],
  )
  if (variant === 'detail') {
    entries.push(['标签', anime.tags.join(' ')])
  }
  if (anime.website) {
    entries.push(['官方网站', anime.website])
  }
  return (
    <ul className="age-detail-info-list">
      {entries.map(([label, value]) => (
        <li key={label}>
          <span className="age-detail-info-label">{label}：</span>
          <span className="age-detail-info-value">
            {label === '官方网站' ? (
              <a href={value} target="_blank" rel="noreferrer">
                {value}
              </a>
            ) : (
              value
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
