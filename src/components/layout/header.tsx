import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { Moon, Search, Sun, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchHistory } from '@/stores/search-history'
import { useTheme } from '@/stores/theme'

const NAV_ITEMS = [
  { to: '/', label: '首页' },
  { to: '/catalog', label: '目录' },
  { to: '/weekly', label: '一周更新' },
  { to: '/ranking', label: '排行榜' },
  { to: '/collections', label: '收藏' },
  { to: '/history', label: '历史' },
]

export function Header() {
  const [keyword, setKeyword] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const history = useSearchHistory((s) => s.items)
  const clearHistory = useSearchHistory((s) => s.clear)
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const kw = keyword.trim()
    if (kw) navigate(`/search?kw=${encodeURIComponent(kw)}`)
  }

  function searchTo(kw: string) {
    setKeyword(kw)
    navigate(`/search?kw=${encodeURIComponent(kw)}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
        <Link to="/" className="text-lg font-bold tracking-wide">
          AGE动漫
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-sm transition-colors hover:text-foreground ${
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <form onSubmit={handleSubmit} className="relative ml-auto flex items-center gap-1.5" role="search">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="搜索番剧…"
            aria-label="搜索番剧"
            className="h-9 w-40 md:w-56"
          />
          <Button type="submit" size="icon" variant="ghost" aria-label="搜索">
            <Search />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={theme === 'dark' ? '切换亮色模式' : '切换暗色模式'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          {focused && history.length > 0 ? (
            <div className="absolute right-10 top-full z-50 mt-1 w-56 rounded-md border bg-background p-2 shadow-md">
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">搜索历史</span>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  清空
                </button>
              </div>
              <ul className="max-h-60 space-y-0.5 overflow-y-auto">
                {history.map((kw) => (
                  <li key={kw}>
                    <button
                      type="button"
                      onMouseDown={() => searchTo(kw)}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <span className="truncate">{kw}</span>
                      <X
                        className="size-3.5 shrink-0 text-muted-foreground"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          useSearchHistory.getState().remove(kw)
                        }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </div>
      <nav className="container flex items-center gap-5 pb-2 md:hidden" aria-label="移动端导航">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
