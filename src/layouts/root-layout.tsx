import { Outlet } from 'react-router'

import { Backtop } from '@/components/layout/backtop'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Backtop />
    </div>
  )
}
