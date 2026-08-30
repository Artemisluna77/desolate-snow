import { Link } from 'react-router'

import { HOME_RECOMMEND } from '@/data/home-data'
import { usePageTitle } from '@/hooks/use-page-title'

export function RecommendPage() {
  usePageTitle('今日推荐')

  return (
    <div className="age-main-wrapper">
      <div className="age-container age-content-container">
        <section className="age-home-panel age-recommend-page">
          <div className="age-section-header">
            <h1 className="age-section-title">今日推荐</h1>
          </div>
          <div className="age-video-grid">
            {HOME_RECOMMEND.map((item) => (
              <Link key={item.id} to={`/detail/${item.id}`} className="age-video-card">
                <div className="age-video-image">
                  <img src={item.coverUrl} alt={item.title} referrerPolicy="no-referrer" />
                  <span className="age-video-episode">{item.episode}</span>
                </div>
                <div className="age-video-title" title={item.title}>
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
