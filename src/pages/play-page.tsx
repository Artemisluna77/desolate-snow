import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import { AnimeInfoList } from '@/components/anime/anime-info-list'
import { AnimeStats } from '@/components/anime/anime-stats'
import { EpisodePanel } from '@/components/anime/episode-panel'
import { RecommendCard } from '@/components/anime/recommend-card'
import { AgedmPlayer } from '@/components/player/agedm-player'
import { DegradedNotice } from '@/components/common/degraded-notice'
import { getAgeRecommendations } from '@/data/age-page-data'
import type { AgeDetailData } from '@/types/agedm'
import { useAgedmDetail, useAgedmPlayback } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'
import { usePlayComments } from '@/stores/play-comments'
import { useWatchHistory } from '@/stores/watch-history'

function PlayInfoCard({ anime }: { anime: AgeDetailData }) {
  return (
    <div className="age-play-info-card">
      <div className="age-play-info-cover">
        <img src={anime.coverUrl} alt={anime.title} loading="lazy" />
      </div>
      <div className="age-play-info-body">
        <h1>{anime.title}</h1>
        <p className="age-play-info-summary">{anime.summary}</p>
        <AnimeInfoList anime={anime} variant="play" />
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

export function PlayPage() {
  const { id, source, episode } = useParams()
  const navigate = useNavigate()
  const animeId = id ? Number(id) : null
  const valid = animeId !== null && Number.isInteger(animeId) && animeId > 0
  const requestedSource = Math.max(1, Number(source) || 1)
  const episodeNumber = Math.max(1, Number(episode) || 1)

  const { data: anime, isDegraded } = useAgedmDetail(valid ? animeId : null)
  const sourceOptions = anime.sources
  const sourceIndex = Math.min(requestedSource, sourceOptions.length) - 1
  const selectedSource = sourceOptions[sourceIndex] ?? sourceOptions[0]
  const playbackQuery = useAgedmPlayback(
    valid && animeId !== null ? animeId : null,
    sourceIndex + 1,
    episodeNumber,
  )
  const add = useWatchHistory((state) => state.add)
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

  usePageTitle('播放 ' + anime.title + ' 第' + episodeNumber + '集')

  useEffect(() => {
    if (!valid || currentEpisode === undefined) return
    add({
      animeId: anime.id,
      animeTitle: anime.title,
      episode: currentEpisode,
      source: sourceIndex + 1,
    })
  }, [add, anime.id, anime.title, currentEpisode, sourceIndex, valid])

  if (!valid) {
    return (
      <div className="age-page-main">
        <div className="age-container">
          <section className="age-page-panel age-play-panel">无效的播放地址</section>
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
        <DegradedNotice show={isDegraded} />
        <section className="age-page-panel age-play-panel">
          <div className="age-play-player">
            <AgedmPlayer playback={playback} />
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
          <AnimeStats anime={anime} variant="play" />
          <hr />
          <PlayInfoCard anime={anime} />
        </section>

        <section className="age-page-panel age-play-panel">
          {/* key：播放会话的线路变化时重置面板，页签浏览状态跟随 URL */}
          <EpisodePanel
            key={sourceIndex}
            sources={sourceOptions}
            playing={{ sourceIndex, episode: episodeNumber }}
            columns={9}
            sort
            onSelectEpisode={(selectedSourceIndex, selectedEpisode) =>
              switchTo(selectedEpisode, selectedSourceIndex)
            }
          />
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

        <section className="age-page-panel age-play-panel">
          <div className="age-detail-section-title">
            <span>
              <ThumbsUp /> 相关推荐
            </span>
          </div>
          <hr />
          <div className="age-play-recommend-grid">
            {getAgeRecommendations(anime.recommended).map((item) => (
              <div key={item.id} className="age-play-recommend-card">
                <RecommendCard item={item} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
