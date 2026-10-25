import { useState } from 'react'
import { ArrowDownUp, Play } from 'lucide-react'
import { Link } from 'react-router'

import type { AgeDetailSource } from '@/types/agedm'

interface EpisodePanelProps {
  sources: AgeDetailSource[]
  /** 正在播放的线路与集数；提供时在对应集数上显示官方同款「正在播放」遮罩 */
  playing?: { sourceIndex: number; episode: number }
  /** 官方 play 页 9 列 / detail 页 6 列 */
  columns?: 6 | 9
  /** 「更改排序」开关（官方 play 页有） */
  sort?: boolean
  /** 提供则渲染为 <Link>（可中键新开，对齐官方真 <a href>），否则渲染为 button */
  hrefOf?: (sourceIndex: number, episode: number) => string
  /** 未提供 hrefOf 时的选集回调 */
  onSelectEpisode?: (sourceIndex: number, episode: number) => void
}

const HINT = '视频如果未正常播放或者卡顿，请切换播放源，优先选择 VIP 播放源！'

/**
 * 选集面板（GLOSSARY）：线路页签 + 选集宫格 + 排序 + 正在播放指示的一体化有状态模块。
 * 页签浏览状态属于面板内部——切换页签只换列表，不影响播放会话（官方 tab-pane 同款行为）。
 * 页面的播放会话变化时用 key 重置面板（URL 线路变化 → 浏览页签跟随）。
 */
export function EpisodePanel({
  sources,
  playing,
  columns = 6,
  sort = false,
  hrefOf,
  onSelectEpisode,
}: EpisodePanelProps) {
  const [activeSourceIndex, setActiveSourceIndex] = useState(playing?.sourceIndex ?? 0)
  const [ascending, setAscending] = useState(true)
  const activeSource = sources[Math.min(activeSourceIndex, sources.length - 1)] ?? sources[0]
  const episodes = activeSource?.episodes ?? []
  const displayed = ascending ? episodes : [...episodes].reverse()

  return (
    <div className="age-episode-panel">
      <div className="age-detail-section-title">
        <span>
          <Play /> 在线播放
        </span>
        <small>{HINT}</small>
      </div>
      <hr />
      <div className="age-play-source-row">
        <div className="age-detail-source-tabs" role="tablist" aria-label="播放线路">
          {sources.map((item, index) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={index === activeSourceIndex}
              className={index === activeSourceIndex ? 'is-active' : undefined}
              onClick={() => setActiveSourceIndex(index)}
            >
              {item.isVip ? <span>VIP</span> : null} {item.label}
            </button>
          ))}
        </div>
        {sort ? (
          <button
            type="button"
            className="age-play-order-toggle"
            aria-pressed={!ascending}
            title="更改排序"
            onClick={() => setAscending((value) => !value)}
          >
            <ArrowDownUp /> 更改排序
          </button>
        ) : null}
      </div>
      <div className="age-detail-episode-panel" role="tabpanel">
        <ul className={columns === 9 ? 'is-cols-9' : undefined}>
          {displayed.map((episode) => {
            const isPlaying =
              playing !== undefined &&
              activeSourceIndex === playing.sourceIndex &&
              episode.number === playing.episode
            return (
              <li key={episode.number}>
                {hrefOf ? (
                  <Link
                    to={hrefOf(activeSourceIndex, episode.number)}
                    aria-current={isPlaying}
                    title={episode.title}
                  >
                    {episode.title}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-current={isPlaying}
                    onClick={() => onSelectEpisode?.(activeSourceIndex, episode.number)}
                  >
                    {episode.title}
                  </button>
                )}
                {isPlaying ? (
                  <div className="age-play-episode-playing" aria-hidden="true">
                    <div className="loader-play" />
                  </div>
                ) : null}
              </li>
            )
          })}
          {episodes.length === 0 ? (
            <li className="age-play-episode-empty">暂无分集数据</li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}
