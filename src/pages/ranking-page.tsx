import { useState } from 'react'
import { Link } from 'react-router'

import { AGE_RANK_BOARDS, type AgeRankBoard, type AgeRankItem } from '@/data/age-page-data'
import { useAgedmRank } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'

const YEARS = Array.from({ length: 27 }, (_, index) => String(2026 - index))

function RankItem({ item, index }: { item: AgeRankItem; index: number }) {
  return (
    <div className="age-rank-item">
      <div className={`age-rank-number${index < 10 ? ' is-top' : ''}`}>{index + 1}</div>
      <div className="age-rank-title">
        <Link to={`/detail/${item.id}`} title={item.title}>
          {item.title}
        </Link>
      </div>
      <div className="age-rank-views">{item.views}</div>
    </div>
  )
}

function RankBoard({ board }: { board: AgeRankBoard }) {
  return (
    <section className="age-rank-board">
      <h2>{board.title}</h2>
      <div>
        {board.items.map((item, index) => (
          <RankItem key={`${board.title}-${item.id}-${index}`} item={item} index={index} />
        ))}
      </div>
    </section>
  )
}

/** 排行榜：目标站点的年份选择器与周榜、月榜、总榜三列 TOP50。 */
export function RankingPage() {
  usePageTitle('排行榜')
  const [year, setYear] = useState('all')
  const rankQuery = useAgedmRank(year)
  const rank = rankQuery.data?.data ?? {
    year,
    total: AGE_RANK_BOARDS.reduce((total, board) => total + board.items.length, 0),
    boards: AGE_RANK_BOARDS,
    updatedAt: '',
  }
  const updatedAt = rank.updatedAt
    ? rank.updatedAt.replace('T', ' ').slice(0, 19)
    : rankQuery.data?.meta.fetchedAt.replace('T', ' ').slice(0, 19)

  return (
    <div className="age-page-main">
      <div className="age-container">
        <section className="age-page-panel age-rank-panel">
          <div className="age-rank-header">
            <h1>
              <select
                aria-label="请选择年份"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                <option value="all">请选择年份</option>
                {YEARS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </h1>
          </div>
          <div className="age-rank-grid">
            {rank.boards.map((board) => (
              <RankBoard key={board.title} board={board} />
            ))}
            <p className="age-rank-updated">
              <em>最后更新时间：{updatedAt ?? '暂缺'}</em>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
