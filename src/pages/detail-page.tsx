import { useMemo, useState } from 'react'
import { Flame, Heart, MessageSquare, Play, ThumbsUp } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { AGE_DETAIL_RECOMMENDATIONS, getAgeDetail, type AgeDetailData, type AgeUpdateItem } from '@/data/age-page-data'
import { ageCover } from '@/data/home-data'
import { usePageTitle } from '@/hooks/use-page-title'
import { useCollections } from '@/stores/collections'
import type { AnimeSummary } from '@/types/anime'

const SOURCE_LABELS = ['VIP 西瓜', '非凡', '暴风', '无尽', '计算云']

function toCollectionSummary(anime: AgeDetailData): AnimeSummary {
  return {
    id: anime.id,
    title: anime.title,
    titleCn: null,
    coverUrl: anime.coverUrl,
    rating: null,
    rank: null,
    airDate: anime.airDate,
    episodeCount: anime.episodeCount,
    tags: anime.tags,
    platform: anime.platform,
  }
}

function CollectButton({ anime }: { anime: AgeDetailData }) {
  const collected = useCollections((state) => state.has(anime.id))
  const toggle = useCollections((state) => state.toggle)
  return (
    <div className="age-detail-collect">
      <button
        type="button"
        aria-label={collected ? '取消收藏' : '收藏'}
        aria-pressed={collected}
        onClick={() => toggle(toCollectionSummary(anime))}
      >
        <Heart className={collected ? 'is-filled' : undefined} />
      </button>
    </div>
  )
}

function DetailInfo({ anime }: { anime: AgeDetailData }) {
  const entries = [
    ['地区', anime.region],
    ['动画种类', anime.platform],
    ['原版名称', anime.original],
    ['其他名称', anime.other],
    ['原作', anime.author],
    ['制作公司', anime.company],
    ['首播时间', anime.airDate],
    ['播放状态', anime.status],
    ['剧情类型', anime.genres],
    ['标签', anime.tags.join(' ')],
    ...(anime.website ? [['官方网站', anime.website]] : []),
  ]
  return (
    <section className="age-detail-box">
      <div className="age-detail-box-body">
        <h2>基本信息</h2>
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
      </div>
    </section>
  )
}

function RelatedAnime({ anime }: { anime: AgeDetailData }) {
  return (
    <section className="age-detail-box age-detail-related">
      <div className="age-detail-box-body">
        <h2>相关动画</h2>
        <ul>
          {anime.related.map((item) => (
            <li key={item.id}>
              <Link to={`/detail/${item.id}`}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function EpisodePlaylist({ anime }: { anime: AgeDetailData }) {
  const [source, setSource] = useState(0)
  const episodes = useMemo(
    () => Array.from({ length: anime.episodeCount }, (_, index) => index + 1),
    [anime.episodeCount],
  )

  return (
    <section className="age-detail-playlist">
      <div className="age-detail-section-title">
        <span>
          <Play /> 在线播放
        </span>
        <small>视频如果未正常播放或者卡顿，请切换播放源，优先选择 VIP 播放源!</small>
      </div>
      <hr />
      <div className="age-detail-source-tabs" role="tablist" aria-label="播放源">
        {SOURCE_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={source === index}
            className={source === index ? 'is-active' : undefined}
            onClick={() => setSource(index)}
          >
            {index === 0 ? <span>VIP</span> : null} {label.replace('VIP ', '')}
          </button>
        ))}
      </div>
      <div className="age-detail-episode-panel" role="tabpanel">
        <ul>
          {episodes.map((episode) => (
            <li key={episode}>
              <Link to={`/play/${anime.id}/${source + 1}/${episode}`}>
                第{String(episode).padStart(2, '0')}集
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function RecommendationCard({ item }: { item: AgeUpdateItem }) {
  return (
    <div className="age-detail-recommend-column">
      <div className="age-detail-recommend-card">
        <div className="age-detail-recommend-image">
          <Link to={`/detail/${item.id}`} title={item.title}>
            <img src={ageCover(item.id)} alt={item.title} loading="lazy" />
            <span>{item.episode}</span>
          </Link>
        </div>
        <div className="age-detail-recommend-title">
          <Link to={`/detail/${item.id}`} title={item.title}>
            {item.title}
          </Link>
        </div>
      </div>
    </div>
  )
}

function Recommendations() {
  return (
    <section className="age-detail-recommendations">
      <div className="age-detail-section-title">
        <span>
          <ThumbsUp /> 相关推荐
        </span>
      </div>
      <hr />
      <div className="age-detail-recommend-body">
        <div className="age-detail-recommend-grid">
          {AGE_DETAIL_RECOMMENDATIONS.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function DetailPage() {
  const { id } = useParams()
  const animeId = id ? Number(id) : Number.NaN
  const valid = Number.isInteger(animeId) && animeId > 0
  const anime = getAgeDetail(valid ? animeId : 0)
  usePageTitle(valid ? anime.title : '番剧详情')

  if (!valid) {
    return (
      <div className="age-page-main">
        <div className="age-container">
          <section className="age-page-panel age-detail-invalid">无效的条目 ID</section>
        </div>
      </div>
    )
  }

  return (
    <div className="age-page-main">
      <div className="age-container">
        <section className="age-page-panel age-detail-panel">
          <div className="age-detail-layout">
            <aside className="age-detail-left">
              <div className="age-detail-cover">
                <img src={anime.coverUrl} alt={anime.title} width="256" height="356" />
                <CollectButton anime={anime} />
              </div>
              <div className="age-detail-stats">
                <div><Flame /> {anime.stats.views}</div>
                <div><MessageSquare /> {anime.stats.comments}</div>
                <div><Heart /> {anime.stats.likes}</div>
              </div>
              <DetailInfo anime={anime} />
              <RelatedAnime anime={anime} />
            </aside>

            <main className="age-detail-right">
              <h1>{anime.title}</h1>
              <hr />
              <p className="age-detail-description">{anime.summary}</p>
              <EpisodePlaylist anime={anime} />
              <Recommendations />
            </main>
          </div>
        </section>
      </div>
    </div>
  )
}
