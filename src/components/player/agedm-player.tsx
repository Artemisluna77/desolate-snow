import type { AgedmPlayback } from '@/api/agedm-client'

interface AgedmPlayerProps {
  playback: AgedmPlayback | null
}

/**
 * AGE 的公开播放接口返回的是带签名参数的播放器入口，而不是原始媒体文件，
 * 因此保留 AGE 自己的 ArtPlayer（iframe 播放入口）。
 * 服务端对入口基址做白名单校验（server getPlayPayload），播放器形态由 playback.kind 表述。
 */
export function AgedmPlayer({ playback }: AgedmPlayerProps) {
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
