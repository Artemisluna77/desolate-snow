import { Eye, Flame, Heart, MessageSquare } from 'lucide-react'

import type { AgeDetailData } from '@/types/agedm'

interface AnimeStatsProps {
  anime: AgeDetailData
  /** detail：官方详情页的深色统计条（仅图标+数值）；play：官方播放页的行内统计（图标+标签+数值） */
  variant?: 'detail' | 'play'
}

/** 番剧统计条（GLOSSARY「番剧展示域」）：views/comments/likes 两种官方形态。 */
export function AnimeStats({ anime, variant = 'detail' }: AnimeStatsProps) {
  if (variant === 'play') {
    const entries = [
      { icon: Eye, label: '播放数', value: anime.stats.views },
      { icon: MessageSquare, label: '评论', value: anime.stats.comments },
      { icon: Heart, label: '点赞', value: anime.stats.likes },
    ]
    return (
      <div className="age-play-stats">
        {entries.map(({ icon: Icon, label, value }) => (
          <div key={label}>
            <Icon /> {label} <strong>{value}</strong>
          </div>
        ))}
      </div>
    )
  }
  const entries = [
    { icon: Flame, value: anime.stats.views, label: '播放数' },
    { icon: MessageSquare, value: anime.stats.comments, label: '评论' },
    { icon: Heart, value: anime.stats.likes, label: '点赞' },
  ]
  return (
    <div className="age-detail-stats">
      {entries.map(({ icon: Icon, value, label }) => (
        <div key={label}>
          <Icon /> {value}
        </div>
      ))}
    </div>
  )
}
