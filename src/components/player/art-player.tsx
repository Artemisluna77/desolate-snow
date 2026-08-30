import { useEffect, useRef } from 'react'
import Artplayer from 'artplayer'

interface ArtPlayerProps {
  url: string
  poster?: string
  type?: string
}

/** 直接拿到合法媒体地址时使用的 ArtPlayer 封装。 */
export function ArtPlayerVideo({ url, poster, type }: ArtPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const player = new Artplayer({
      container: containerRef.current,
      url,
      poster,
      type,
      theme: '#1677ff',
      autoplay: false,
      mutex: true,
      fullscreen: true,
      fullscreenWeb: true,
      pip: true,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      moreVideoAttr: {
        playsInline: true,
        preload: 'metadata',
      },
    })

    return () => {
      player.destroy(false)
    }
  }, [poster, type, url])

  return <div ref={containerRef} className="age-art-player" />
}
