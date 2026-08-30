import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/layouts/root-layout'
import { HomePage } from '@/pages/home-page'
import { RecommendPage } from '@/pages/recommend-page'
import { CatalogPage } from '@/pages/catalog-page'
import { DetailPage } from '@/pages/detail-page'
import { PlayPage } from '@/pages/play-page'
import { SearchPage } from '@/pages/search-page'
import { WeeklyPage } from '@/pages/weekly-page'
import { RankingPage } from '@/pages/ranking-page'
import { CollectionsPage } from '@/pages/collections-page'
import { HistoryPage } from '@/pages/history-page'
import { ComponentsDemoPage } from '@/pages/dev/components-demo-page'
import { RootErrorBoundary } from '@/pages/root-error-boundary'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      { index: true, Component: HomePage },
      { path: 'catalog', Component: CatalogPage },
      { path: 'catalog/all-all-all-all-all-time-1', Component: CatalogPage },
      { path: 'catalog/*', Component: CatalogPage },
      { path: 'detail/:id', Component: DetailPage },
      { path: 'play/:id/:source/:episode', Component: PlayPage },
      { path: 'search', Component: SearchPage },
      { path: 'weekly', Component: WeeklyPage },
      { path: 'update', Component: WeeklyPage },
      { path: 'ranking', Component: RankingPage },
      { path: 'rank', Component: RankingPage },
      { path: 'recommend', Component: RecommendPage },
      { path: 'collections', Component: CollectionsPage },
      { path: 'history', Component: HistoryPage },
      { path: 'dev/components', Component: ComponentsDemoPage },
    ],
  },
])
