import { useState } from 'react'
import { Link } from 'react-router'

import {
  AGE_BANNER_URL,
  HOME_FRIEND_LINKS,
  HOME_RECENT,
  HOME_RECENT_UPDATES,
  HOME_RECOMMEND,
  HOME_SCHEDULE,
  type HomeRecentUpdate,
  type HomeScheduleDay,
  type HomeScheduleItem,
  type HomeVideoCard as HomeVideoCardData,
} from '@/data/home-data'
import { useAgedmHome } from '@/hooks/use-agedm'
import { usePageTitle } from '@/hooks/use-page-title'

function todayIndex(): number {
  return (new Date().getDay() + 6) % 7
}

function SectionHeader({ title, moreTo }: { title: string; moreTo?: string }) {
  return (
    <div className="age-section-header">
      <h2 className="age-section-title">
        {moreTo ? (
          <Link to={moreTo} className="age-more-link">
            更多 »
          </Link>
        ) : null}
        {title}
      </h2>
    </div>
  )
}

function CoverFallback() {
  return (
    <div className="age-cover-fallback" aria-hidden="true">
      <span className="age-cover-fallback-mark">✧</span>
      <span>AGE.TV</span>
    </div>
  )
}

function VideoCard({ item }: { item: HomeVideoCardData }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link to={`/detail/${item.id}`} className="age-video-card">
      <div className="age-video-image">
        {imageFailed ? (
          <CoverFallback />
        ) : (
          <img
            src={item.coverUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="age-video-episode">{item.episode}</span>
        <span className="age-video-hover" aria-hidden="true">
          ▶
        </span>
      </div>
      <div className="age-video-title" title={item.title}>
        {item.title}
      </div>
    </Link>
  )
}

function VideoSection({
  title,
  moreTo,
  items,
}: {
  title: string
  moreTo: string
  items: HomeVideoCardData[]
}) {
  return (
    <section className="age-video-section">
      <SectionHeader title={title} moreTo={moreTo} />
      <div className="age-video-grid">
        {items.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function AppBanner() {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <a
      href="https://www.ageapp.app?ref=ageweb"
      target="_blank"
      rel="noreferrer"
      className="age-app-banner"
    >
      {imageFailed ? (
        <span className="age-app-banner-fallback">下载 APP 客户端 - 追番更有爱 ♥</span>
      ) : (
        <img
          src={AGE_BANNER_URL}
          alt="app下载"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      )}
    </a>
  )
}

function ScheduleRow({ item }: { item: HomeScheduleItem }) {
  return (
    <li className={item.finished ? 'age-schedule-item age-schedule-finished' : 'age-schedule-item'}>
      <Link to={`/detail/${item.id}`} className="age-schedule-row">
        <span className="age-schedule-name">{item.title}</span>
        {item.isNew ? <span className="age-schedule-new">New!</span> : null}
        <span className="age-schedule-sub">{item.episode}</span>
      </Link>
    </li>
  )
}

function WeeklySection({ schedule }: { schedule: HomeScheduleDay[] }) {
  const [selected, setSelected] = useState(todayIndex)
  const current = schedule[selected] ?? schedule[0]

  return (
    <section className="age-text-section age-weekly-section">
      <SectionHeader title="本周放送列表" />
      <div className="age-weekly-body">
        <div className="age-week-tabs" role="tablist" aria-label="选择星期">
          {schedule.map((day, index) => (
            <button
              key={day.label}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls={`week-panel-${index}`}
              className={selected === index ? 'is-active' : ''}
              onClick={() => setSelected(index)}
            >
              {day.label}
            </button>
          ))}
        </div>
        <div id={`week-panel-${selected}`} role="tabpanel" aria-label={current?.label}>
          <ul className="age-text-list">
            {current?.items.map((item) => (
              <ScheduleRow key={item.id} item={item} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function RecentUpdatesSection({ items }: { items: HomeRecentUpdate[] }) {
  return (
    <section className="age-text-section age-recent-list-section">
      <SectionHeader title="最近更新" />
      <ul className="age-text-list">
        {items.map((item) => (
          <li key={item.id} className="age-schedule-item">
            <Link to={`/detail/${item.id}`} className="age-schedule-row">
              <span className="age-schedule-name">{item.title}</span>
              <span className="age-schedule-sub">{item.date}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FriendLinksSection() {
  return (
    <section className="age-text-section age-friend-section">
      <SectionHeader title="友情链接" />
      <div className="age-friend-links">
        {HOME_FRIEND_LINKS.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </section>
  )
}

export function HomePage() {
  usePageTitle('首页')
  const homeQuery = useAgedmHome()
  const home = homeQuery.data?.data ?? {
    latest: HOME_RECENT,
    recommend: HOME_RECOMMEND,
    schedule: HOME_SCHEDULE,
    recentUpdates: HOME_RECENT_UPDATES,
  }

  return (
    <div className="age-main-wrapper">
      <div className="age-container age-content-container">
        <section className="age-home-panel">
          <div className="age-home-grid">
            <div className="age-home-primary">
              <VideoSection title="最近更新" moreTo="/update" items={home.latest} />
              <AppBanner />
              <VideoSection title="今日推荐" moreTo="/recommend" items={home.recommend} />
            </div>
            <aside className="age-home-sidebar">
              <WeeklySection schedule={home.schedule} />
              <RecentUpdatesSection items={home.recentUpdates} />
            </aside>
            <FriendLinksSection />
          </div>
        </section>
      </div>
    </div>
  )
}
