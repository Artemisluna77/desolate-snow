import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const NAV_ITEMS = [
  { to: '/', label: '首页' },
  { to: '/catalog', label: '目录' },
  { to: '/weekly', label: '一周更新' },
  { to: '/ranking', label: '排行榜' },
]

export function Header() {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const kw = keyword.trim()
    if (kw) navigate(`/search?kw=${encodeURIComponent(kw)}`)
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
        <form onSubmit={handleSubmit} className="ml-auto flex items-center gap-1.5" role="search">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索番剧…"
            aria-label="搜索番剧"
            className="h-9 w-40 md:w-56"
          />
          <Button type="submit" size="icon" variant="ghost" aria-label="搜索">
            <Search />
          </Button>
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
