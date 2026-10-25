import { Heart, ThumbsUp } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { AnimeInfoList } from '@/components/anime/anime-info-list'
import { AnimeStats } from '@/components/anime/anime-stats'
import { EpisodePanel } from '@/components/anime/episode-panel'
import { RecommendCard } from '@/components/anime/recommend-card'
import { DegradedNotice } from '@/components/common/degraded-notice'
import { getAgeRecommendations } from '@/data/age-page-data'
import type { AgeDetailData } from '@/types/agedm'
import { useAgedmDetail } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'
import { useCollections, type CollectionEntry } from '@/stores/collections'

function toCollectionEntry(anime: AgeDetailData): CollectionEntry {
  return {
    animeId: anime.id,
    title: anime.title,
    titleCn: null,
    coverUrl: anime.coverUrl,
    episodeCount: anime.episodeCount,
    rating: null,
    airDate: anime.airDate,
    addedAt: Date.now(),
  }
}

function CollectButton({ anime }: { anime: AgeDetailData }) {
  const items = useCollections((state) => state.items)
  const add = useCollections((state) => state.add)
  const remove = useCollections((state) => state.remove)
  const collected = items.some((entry) => entry.animeId === anime.id)
  return (
    <div className="age-detail-collect">
      <button
        type="button"
        aria-label={collected ? '取消收藏' : '收藏'}
        aria-pressed={collected}
        onClick={() => (collected ? remove(String(anime.id)) : add(toCollectionEntry(anime)))}
      >
        <Heart className={collected ? 'is-filled' : undefined} />
      </button>
    </div>
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

export function DetailPage() {
  const { id } = useParams()
  const animeId = id ? Number(id) : Number.NaN
  const valid = Number.isInteger(animeId) && animeId > 0
  const { data: anime, isDegraded } = useAgedmDetail(valid ? animeId : null)
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
        <DegradedNotice show={isDegraded} />
        <section className="age-page-panel age-detail-panel">
          <div className="age-detail-layout">
            <aside className="age-detail-left">
              <div className="age-detail-cover">
                <img src={anime.coverUrl} alt={anime.title} width="256" height="356" />
                <CollectButton anime={anime} />
              </div>
              <AnimeStats anime={anime} variant="detail" />
              <section className="age-detail-box">
                <div className="age-detail-box-body">
                  <h2>基本信息</h2>
                  <AnimeInfoList anime={anime} variant="detail" />
                </div>
              </section>
              <RelatedAnime anime={anime} />
            </aside>

            <main className="age-detail-right">
              <h1>{anime.title}</h1>
              <hr />
              <p className="age-detail-description">{anime.summary}</p>
              <section className="age-detail-playlist">
                <EpisodePanel
                  sources={anime.sources}
                  columns={6}
                  hrefOf={(sourceIndex, episodeNumber) =>
                    '/play/' + anime.id + '/' + (sourceIndex + 1) + '/' + episodeNumber
                  }
                />
              </section>
              <section className="age-detail-recommendations">
                <div className="age-detail-section-title">
                  <span>
                    <ThumbsUp /> 相关推荐
                  </span>
                </div>
                <hr />
                <div className="age-detail-recommend-body">
                  <div className="age-detail-recommend-grid">
                    {getAgeRecommendations(anime.recommended).map((item) => (
                      <div key={item.id} className="age-detail-recommend-column">
                        <RecommendCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </main>
          </div>
        </section>
      </div>
    </div>
  )
}
