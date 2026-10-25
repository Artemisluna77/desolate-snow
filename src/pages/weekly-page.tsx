import { Link } from 'react-router'

import { ageCover } from '@/data/home-data'
import { useAgedmUpdate } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'
import { DegradedNotice } from '@/components/common/degraded-notice'
import type { AgeUpdateItem } from '@/types/agedm'

function UpdateCard({ item }: { item: AgeUpdateItem }) {
  return (
    <div className="age-update-column">
      <div className="age-update-card">
        <div className="age-update-image">
          <Link to={`/detail/${item.id}`} title={item.title}>
            <img src={item.coverUrl ?? ageCover(item.id)} alt={item.title} />
            <span>{item.episode}</span>
          </Link>
        </div>
        <div className="age-update-title">
          <Link to={`/detail/${item.id}`} title={item.title}>
            {item.title}
          </Link>
        </div>
      </div>
    </div>
  )
}

function UpdateGroup({ label, items }: { label: string; items: AgeUpdateItem[] }) {
  return (
    <section className="age-update-group">
      <div className="age-update-heading">
        <div />
        <button type="button">{label}</button>
      </div>
      <div className="age-update-board">
        <div className="age-update-grid">
          {items.map((item) => (
            <UpdateCard key={`${item.id}-${item.episode}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** 一周更新：按目标站点的日期分组，以六列海报墙呈现。 */
export function WeeklyPage() {
  usePageTitle('一周更新')
  const { data: updateData, isDegraded } = useAgedmUpdate(1, 60)
  const groups = updateData.groups

  return (
    <div className="age-page-main">
      <div className="age-container">
        <DegradedNotice show={isDegraded} />
        <section className="age-page-panel age-update-panel">
          {groups.map((group) => (
            <UpdateGroup key={group.label} label={group.label} items={group.items} />
          ))}
        </section>
      </div>
    </div>
  )
}
