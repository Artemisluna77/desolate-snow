export interface PlaybackSource {
  /** 视频直链(演示实现返回公共演示片) */
  url: string
  label: string
}

export interface PlaybackProvider {
  readonly sources: PlaybackSource[]
  getSource(index: number, animeId: number, episode: number): PlaybackSource
}

/**
 * 演示播放源:不提供任何真实番剧内容,统一返回公共演示视频,
 * 用于验证播放器交互(线路/选集切换)。接入自有合法授权源时实现新 Provider。
 */
export const demoPlaybackProvider: PlaybackProvider = {
  sources: [
    { label: '线路一', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { label: '线路二', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { label: '线路三', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  ],
  getSource(index, animeId, episode) {
    const fallback = this.sources[0]
    const source = this.sources[index] ?? fallback
    return { ...source, url: `${source.url}#anime=${animeId}&ep=${episode}` }
  },
}
