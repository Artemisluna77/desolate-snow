import { NavLink, Outlet } from 'react-router'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/catalog', label: '目录' },
  { to: '/weekly', label: '一周更新' },
  { to: '/ranking', label: '排行榜' },
]

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <nav className="container flex items-center gap-6 py-3">
          <span className="text-lg font-bold">AGE动漫</span>
          {navItems.map((item) => (
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
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        AGE动漫复刻 · 学习用途 · 数据来自 Bangumi 开放 API
      </footer>
    </div>
  )
}
