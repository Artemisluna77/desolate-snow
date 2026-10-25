import { Link } from 'react-router'

import { ageCover } from '@/data/home-data'
import type { AgeUpdateItem } from '@/types/agedm'

/** 推荐卡（GLOSSARY「番剧展示域」）：封面 + 集数角标 + 标题链接，detail/play 共用；网格容器由页面自持。 */
export function RecommendCard({ item }: { item: AgeUpdateItem }) {
  return (
    <>
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
    </>
  )
}
