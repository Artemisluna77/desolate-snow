import { useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { AgedmPlayer } from '@/components/player/agedm-player'
import { getAgeDetail, type AgeDetailData, type AgeDetailSource } from '@/data/age-page-data'
import { useAgedmDetail, useAgedmPlayback } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'
import { cn } from '@/lib/utils'
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

export function PlayPage() {
  const { id, source, episode } = useParams()
  const navigate = useNavigate()
  const animeId = id ? Number(id) : null
  const valid = animeId !== null && Number.isInteger(animeId) && animeId > 0
  const requestedSource = Math.max(1, Number(source) || 1)
  const episodeNumber = Math.max(1, Number(episode) || 1)

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
      <div className="container py-6">
        <p className="text-sm text-muted-foreground">无效的播放地址</p>
      </div>
    )
  }

  function switchTo(nextEpisode: number, nextSource = sourceIndex) {
    navigate('/play/' + anime.id + '/' + (nextSource + 1) + '/' + nextEpisode)
  }

  const playback = playbackQuery.data?.data ?? null
  const targetPlayerUrl =
    'https://www.agedm.io/play/' + anime.id + '/' + (sourceIndex + 1) + '/' + episodeNumber

  return (
    <div className="container py-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Link
          to={'/detail/' + anime.id}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft /> 返回详情
        </Link>
        <h1 className="text-lg font-semibold">
          {anime.title} <span className="text-muted-foreground">第{episodeNumber}集</span>
        </h1>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-lg border bg-black">
            <AgedmPlayer playback={playback} poster={anime.coverUrl} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">线路</span>
            {sourceOptions.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => switchTo(episodeNumber, index)}
                aria-pressed={index === sourceIndex}
                className={cn(
                  'rounded-md px-3 py-1 text-xs transition-colors',
                  index === sourceIndex
                    ? 'bg-primary font-medium text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.isVip ? 'VIP ' : ''}
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && switchTo(prev.number)}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft /> 上一集
            </button>
            <button
              type="button"
              disabled={!next}
              onClick={() => next && switchTo(next.number)}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一集 <ChevronRight />
            </button>
          </div>

          {playbackQuery.isError ? (
            <p className="mt-2 text-xs text-amber-600">
              当前播放入口暂时不可用。你可以
              <a href={targetPlayerUrl} target="_blank" rel="noreferrer" className="mx-1 underline">
                在 AGE 原站打开
              </a>
              继续播放。
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              播放源由 AGE 实时接口提供，当前线路使用 AGE 官方 ArtPlayer 播放入口。
            </p>
          )}
        </div>

        <aside className="w-full shrink-0 lg:w-64">
          <h2 className="mb-2 text-sm font-medium">选集({mainEpisodes.length})</h2>
          <div className="max-h-[480px] space-y-1 overflow-y-auto rounded-lg border p-2">
            {mainEpisodes.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">暂无分集数据</p>
            ) : (
              mainEpisodes.map((item) => (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => switchTo(item.number)}
                  aria-current={item.number === episodeNumber}
                  className={cn(
                    'block w-full truncate rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                    item.number === episodeNumber
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  {item.title}
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
