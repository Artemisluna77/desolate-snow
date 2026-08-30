import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Clock3, Download, Search, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'

import { useSearchHistory } from '@/stores/search-history'
import { useWatchHistory } from '@/stores/watch-history'

const NAV_ITEMS = [
  { to: '/', label: '首页' },
  { to: '/catalog/all-all-all-all-all-time-1', label: '目录' },
  { to: '/update', label: '一周更新' },
  { to: '/rank', label: '排行榜' },
]

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div
      className="age-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="age-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="age-auth-header">
          <h1 id="auth-title" className="age-auth-title">
            <button
              type="button"
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => {
                setMode('login')
                setSubmitted(false)
              }}
            >
              登录
            </button>
            <span className="age-auth-divider">|</span>
            <button
              type="button"
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => {
                setMode('register')
                setSubmitted(false)
              }}
            >
              注册
            </button>
          </h1>
          <button type="button" className="age-auth-close" aria-label="关闭" onClick={onClose}>
            <X />
          </button>
        </div>
        <form className="age-auth-form" onSubmit={handleSubmit}>
          <label>
            <span>用户名</span>
            <input required maxLength={16} placeholder="16个字符内的字母、数字或符号" />
          </label>
          <label>
            <span>密码</span>
            <input required type="password" placeholder="8-32位字母、数字或符号" />
          </label>
          {mode === 'register' ? (
            <label>
              <span>重复密码</span>
              <input required type="password" placeholder="请再次输入密码" />
            </label>
          ) : null}
          <label>
            <span>验证码</span>
            <div className="age-captcha-row">
              <input required placeholder="点击获取" />
              <button type="button">获取</button>
            </div>
          </label>
          {submitted ? <p className="age-auth-message">演示界面：账号功能暂未连接。</p> : null}
          <button type="submit" className="age-auth-submit">
            提交
          </button>
        </form>
      </div>
    </div>
  )
}

function NoticeBar() {
  return (
    <div className="age-notice" id="notice_box">
      <div className="age-container age-notice-container">
        <div className="age-notice-alert">
          <span>AGE动漫 备用地址：</span> <a href="http://www.age.tv">www.age.tv</a>{' '}
          <span>欢迎大家分享给身边朋友！为确保正常观看，请使用</span>{' '}
          <a href="https://www.google.cn/intl/zh-CN/chrome/">谷歌浏览器</a>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [keyword, setKeyword] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const historyWrapperRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const historyItems = useWatchHistory((state) => state.items)
  const clearWatchHistory = useWatchHistory((state) => state.clear)

  useEffect(() => {
    if (!historyOpen) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (historyWrapperRef.current && !historyWrapperRef.current.contains(event.target as Node)) {
        setHistoryOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [historyOpen])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = keyword.trim()
    if (!query) return
    useSearchHistory.getState().add(query)
    setHistoryOpen(false)
    navigate(`/search?query=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <header className="age-header">
        <div className="age-container age-header-container">
          <div className="age-header-row">
            <Link to="/" className="age-logo" aria-label="AGE动漫首页">
              {logoFailed ? (
                <span className="age-logo-text">AGE动漫</span>
              ) : (
                <img
                  src="https://xcdn.aiqingyu1314.com:8443/age/statics/images/logo.png?v=2026082402"
                  alt="AGE动漫"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </Link>

            <nav className="age-nav" aria-label="主导航">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => (isActive ? 'is-active' : '')}
                >
                  {item.label}
                </NavLink>
              ))}
              <a
                href="https://www.ageapp.app?ref=ageweb"
                target="_blank"
                rel="noreferrer"
                className="age-download-link"
              >
                <Download />
                客户端下载
              </a>
            </nav>

            <form className="age-search-form" onSubmit={handleSubmit} role="search">
              <div className="age-search-group">
                <input
                  name="query"
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="输入番名搜索"
                  aria-label="输入番名搜索"
                  maxLength={8}
                />
                <button type="submit" aria-label="搜索">
                  <Search />
                </button>
              </div>
            </form>

            <div className="age-actions" ref={historyWrapperRef}>
              <div className="age-history-wrapper">
                <button
                  type="button"
                  className="age-history-button"
                  aria-label="观看记录"
                  aria-expanded={historyOpen}
                  onClick={() => setHistoryOpen((open) => !open)}
                >
                  <Clock3 />
                </button>
                {historyOpen ? (
                  <div className="age-history-menu">
                    {historyItems.length > 0 ? (
                      historyItems.map((item) => (
                        <Link
                          key={`${item.animeId}-${item.watchedAt}`}
                          to={`/play/${item.animeId}/${item.source}/${item.episode}`}
                          onClick={() => setHistoryOpen(false)}
                        >
                          <span>{item.animeTitle}</span>
                          <em>第{item.episode}集</em>
                        </Link>
                      ))
                    ) : (
                      <p className="age-history-empty">暂无观看记录</p>
                    )}
                    <button
                      type="button"
                      className="age-history-clear"
                      disabled={historyItems.length === 0}
                      onClick={() => {
                        clearWatchHistory()
                        setHistoryOpen(false)
                      }}
                    >
                      清除全部观看记录
                    </button>
                  </div>
                ) : null}
              </div>
              <button type="button" className="age-login-button" onClick={() => setAuthOpen(true)}>
                登录 <span>|</span> 注册
              </button>
            </div>
          </div>
        </div>
      </header>
      {pathname === '/' ? <NoticeBar /> : null}
      {authOpen ? <AuthModal onClose={() => setAuthOpen(false)} /> : null}
    </>
  )
}
