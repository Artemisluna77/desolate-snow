import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageSquare,
  Play,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { AgedmPlayer } from '@/components/player/agedm-player'
import {
  AGE_DETAIL_RECOMMENDATIONS,
  getAgeDetail,
  type AgeDetailData,
  type AgeDetailSource,
  type AgeUpdateItem,
} from '@/data/age-page-data'
import { ageCover } from '@/data/home-data'
import { useAgedmDetail, useAgedmPlayback } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'
import { usePlayComments } from '@/stores/play-comments'
import { useWatchHistory } from '@/stores/watch-history'

const SOURCE_LABELS = ['VIP 西瓜', '非凡', '暴风', '无尽', '计算云']

function fallbackSources(anime: AgeDetailData): AgeDetailSource[] {
  return SOURCE_LABELS.map((label, sourceIndex) => ({
    key: 'fallback-' + sourceIndex,
    label: label.replace('VIP ', ''),
    isVip: sourceIndex === 0,
    episodes: Array.from({ length: anime.episodeCount }, (_, episodeIndex) => ({
      number: episodeIndex + 1,
      title: '第' + String(episodeIndex + 1).padStart(2, '0') + '集',
    })),
  }))
}

function PlayStats({ anime }: { anime: AgeDetailData }) {
  return (
    <div className="age-play-stats">
      <div>
        <Eye /> 播放数 <strong>{anime.stats.views}</strong>
      </div>
      <div>
        <MessageSquare /> 评论 <strong>{anime.stats.comments}</strong>
      </div>
      <div>
        <Heart /> 点赞 <strong>{anime.stats.likes}</strong>
      </div>
    </div>
  )
}

function PlayInfoCard({ anime }: { anime: AgeDetailData }) {
  const entries = [
    ['地区', anime.region],
    ['动画种类', anime.platform],
    ['原版名称', anime.original],
    ['其他名称', anime.other],
    ['原作', anime.author],
    ['播放状态', anime.status],
    ['首播时间', anime.airDate],
    ['剧情类型', anime.genres],
    ['制作公司', anime.company],
    ...(anime.website ? [['官方网站', anime.website]] : []),
  ]
  return (
    <div className="age-play-info-card">
      <div className="age-play-info-cover">
        <img src={anime.coverUrl} alt={anime.title} loading="lazy" />
      </div>
      <div className="age-play-info-body">
        <h1>{anime.title}</h1>
        <p className="age-play-info-summary">{anime.summary}</p>
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
    </div>
  )
}

function PlayComments({ anime }: { anime: AgeDetailData }) {
  const [draft, setDraft] = useState('')
  const [cleanMode, setCleanMode] = useState(false)
  const items = usePlayComments((state) => state.items)
  const add = usePlayComments((state) => state.add)
  const remove = usePlayComments((state) => state.remove)
  const mine = useMemo(
    () => items.filter((item) => item.animeId === anime.id),
    [anime.id, items],
  )

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return
    add({ animeId: anime.id, animeTitle: anime.title, content })
    setDraft('')
  }

  return (
    <section className="age-page-panel age-play-panel age-play-comments">
      <div className="age-detail-section-title">
        <span>
          <MessageSquare /> 评论（{mine.length}）
        </span>
        <button
          type="button"
          className="age-play-clean-toggle"
          aria-pressed={cleanMode}
          onClick={() => setCleanMode((value) => !value)}
        >
          {cleanMode ? '退出清净模式' : '清净模式'}
        </button>
      </div>
      <hr />
      {cleanMode ? (
        <p className="age-play-comments-empty">清净模式已开启，评论区已隐藏。</p>
      ) : (
        <>
          <form className="age-play-comment-form" onSubmit={submit}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="发表你的评论…（仅保存在本机浏览器）"
              rows={3}
            />
            <button type="submit" disabled={!draft.trim()}>
              发布
            </button>
          </form>
          <ul className="age-play-comment-list">
            {mine.length === 0 ? (
              <li className="age-play-comment-empty">还没有评论，来抢沙发吧。</li>
            ) : (
              mine.map((item) => (
                <li key={item.id} className="age-play-comment-item">
                  <p>{item.content}</p>
                  <div className="age-play-comment-meta">
                    <time>{new Date(item.createdAt).toLocaleString('zh-CN')}</time>
                    <button
                      type="button"
                      aria-label="删除评论"
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </section>
  )
}

function RecommendCard({ item }: { item: AgeUpdateItem }) {
  return (
    <div className="age-play-recommend-card">
      <div className="age-detail-recommend-image">
        <Link to={'/detail/' + item.id} title={item.title}>
          <img src={item.coverUrl ?? ageCover(item.id)} alt={item.title} loading="lazy" />
          <span>{item.episode}</span>
        </Link>
      </div>
      <div className="age-detail-recommend-title">
        <Link to={'/detail/' + item.id} title={item.title}>
          {item.title}
        </Link>
      </div>
    </div>
  )
}

function PlayRecommendations({ anime }: { anime: AgeDetailData }) {
  // 官方播放页固定展示 12 条(6 列 × 2 行):上游 similar 优先,不足用本地推荐池补位去重。
  const items = useMemo(() => {
    const extra = AGE_DETAIL_RECOMMENDATIONS.filter(
      (item) => !anime.recommended.some((rec) => rec.id === item.id),
    )
    return [...anime.recommended, ...extra].slice(0, 12)
  }, [anime.recommended])

  return (
    <section className="age-page-panel age-play-panel">
      <div className="age-detail-section-title">
        <span>
          <ThumbsUp /> 相关推荐
        </span>
      </div>
      <hr />
      <div className="age-play-recommend-grid">
        {items.map((item) => (
          <RecommendCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export function PlayPage() {
  const { id, source, episode } = useParams()
  const navigate = useNavigate()
  const animeId = id ? Number(id) : null
  const valid = animeId !== null && Number.isInteger(animeId) && animeId > 0
  const requestedSource = Math.max(1, Number(source) || 1)
  const episodeNumber = Math.max(1, Number(episode) || 1)
  const [episodeAscending, setEpisodeAscending] = useState(true)

  const detailQuery = useAgedmDetail(valid ? animeId : null)
  const fallbackAnime = useMemo(
    () => getAgeDetail(valid && animeId !== null ? animeId : 0),
    [animeId, valid],
  )
  const anime = detailQuery.data?.data ?? fallbackAnime
  const sourceOptions = useMemo(
    () => (anime.sources?.length ? anime.sources : fallbackSources(anime)),
    [anime],
  )
  const sourceIndex = Math.min(requestedSource, sourceOptions.length) - 1
  const selectedSource = sourceOptions[sourceIndex] ?? sourceOptions[0]
  const playbackQuery = useAgedmPlayback(
    valid && animeId !== null ? animeId : null,
    sourceIndex + 1,
    episodeNumber,
  )
  const record = useWatchHistory((state) => state.record)
  const mainEpisodes = selectedSource?.episodes ?? []
  const current =
    mainEpisodes.find((item) => item.number === episodeNumber) ?? mainEpisodes[episodeNumber - 1]
  const currentEpisode = current?.number
  const currentIndex = current ? mainEpisodes.indexOf(current) : -1
  const prev = currentIndex > 0 ? mainEpisodes[currentIndex - 1] : undefined
  const next =
    currentIndex >= 0 && currentIndex < mainEpisodes.length - 1
      ? mainEpisodes[currentIndex + 1]
      : undefined
  const displayedEpisodes = episodeAscending ? mainEpisodes : [...mainEpisodes].reverse()

  usePageTitle('播放 ' + anime.title + ' 第' + episodeNumber + '集')

  useEffect(() => {
    if (!valid || currentEpisode === undefined) return
    record({
      animeId: anime.id,
      animeTitle: anime.title,
      episode: currentEpisode,
      source: sourceIndex + 1,
    })
  }, [anime.id, anime.title, currentEpisode, record, sourceIndex, valid])

  if (!valid) {
    return (
      <div className="age-page-main">
        <div className="age-container">
          <section className="age-page-panel">无效的播放地址</section>
        </div>
      </div>
    )
  }

  function switchTo(nextEpisode: number, nextSource = sourceIndex) {
    navigate('/play/' + anime.id + '/' + (nextSource + 1) + '/' + nextEpisode)
  }

  const playback = playbackQuery.data?.data ?? null

  return (
    <div className="age-page-main">
      <div className="age-container">
        <section className="age-page-panel age-play-panel">
          <div className="age-play-player">
            <AgedmPlayer playback={playback} poster={anime.coverUrl} />
            {next ? (
              <button
                type="button"
                className="age-play-next"
                title="切换下一集"
                aria-label="切换下一集"
                onClick={() => switchTo(next.number)}
              >
                <ChevronRight />
              </button>
            ) : null}
          </div>
        </section>

        <section className="age-page-panel age-play-panel">
          <PlayStats anime={anime} />
          <hr />
          <PlayInfoCard anime={anime} />
        </section>

        <section className="age-page-panel age-play-panel">
          <div className="age-detail-section-title">
            <span>
              <Play /> 在线播放
            </span>
            <small>视频如果未正常播放或者卡顿，请切换播放源，优先选择 VIP 播放源！</small>
          </div>
          <hr />
          <div className="age-play-source-row">
            <div className="age-detail-source-tabs" role="tablist" aria-label="播放线路">
              {sourceOptions.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={index === sourceIndex}
                  className={index === sourceIndex ? 'is-active' : undefined}
                  onClick={() => switchTo(episodeNumber, index)}
                >
                  {item.isVip ? <span>VIP</span> : null} {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="age-play-order-toggle"
              aria-pressed={!episodeAscending}
              title="更改排序"
              onClick={() => setEpisodeAscending((value) => !value)}
            >
              <ArrowDownUp /> 更改排序
            </button>
          </div>
          <div className="age-detail-episode-panel" role="tabpanel">
            <ul>
              {displayedEpisodes.map((item) => (
                <li key={item.number}>
                  <button
                    type="button"
                    className={item.number === episodeNumber ? 'is-active' : undefined}
                    aria-current={item.number === episodeNumber}
                    onClick={() => switchTo(item.number)}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
              {mainEpisodes.length === 0 ? (
                <li className="age-play-episode-empty">暂无分集数据</li>
              ) : null}
            </ul>
          </div>
          <div className="age-play-episode-nav">
            <button type="button" disabled={!prev} onClick={() => prev && switchTo(prev.number)}>
              <ChevronLeft /> 上一集
            </button>
            <button type="button" disabled={!next} onClick={() => next && switchTo(next.number)}>
              下一集 <ChevronRight />
            </button>
          </div>
          {playbackQuery.isError ? (
            <p className="age-play-playback-tip is-warning">
              当前播放入口暂时不可用，请切换线路后重试。
            </p>
          ) : null}
        </section>

        <PlayComments anime={anime} />
        <PlayRecommendations anime={anime} />
      </div>
    </div>
  )
}
