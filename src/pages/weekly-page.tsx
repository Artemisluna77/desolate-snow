import { Link } from 'react-router'

import { AGE_UPDATE_GROUPS, type AgeUpdateItem } from '@/data/age-page-data'
import { ageCover } from '@/data/home-data'
import { useAgedmUpdate } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'

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
  const updateQuery = useAgedmUpdate(1, 60)
  const groups = updateQuery.data?.data.groups ?? AGE_UPDATE_GROUPS

  return (
    <div className="age-page-main">
      <div className="age-container">
        <section className="age-page-panel age-update-panel">
          {groups.map((group) => (
            <UpdateGroup key={group.label} label={group.label} items={group.items} />
          ))}
        </section>
      </div>
    </div>
  )
}
