import type { AgedmPlayback } from '@/api/agedm-client'

import { ArtPlayerVideo } from './art-player'

interface AgedmPlayerProps {
  playback: AgedmPlayback | null
  poster?: string
  directVideoUrl?: string
}

/**
 * AGE 的公开播放接口返回的是带签名参数的播放器入口，而不是原始媒体文件。
 * 因此 iframe 线路保留 AGE 自己的 ArtPlayer；拥有合法直链时则由本地 ArtPlayer 播放。
 */
export function AgedmPlayer({ playback, poster, directVideoUrl }: AgedmPlayerProps) {
  if (directVideoUrl) {
    return <ArtPlayerVideo url={directVideoUrl} poster={poster} />
  }

  if (!playback) {
    return <div className="age-player-placeholder">正在准备播放源…</div>
  }

  return (
    <div className="age-art-player-frame">
      <iframe
        src={playback.iframeUrl}
        title={playback.sourceLabel + ' ' + playback.episodeTitle}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
