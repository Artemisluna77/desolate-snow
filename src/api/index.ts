import type { AnimeDataSource } from './data-source'
import { bangumiSource } from './bangumi-adapter'
import { mockSource } from './mock-source'

/** 任一接口失败时回退 mock 数据源,保证页面离线/限流时仍有内容 */
function withFallback(source: AnimeDataSource): AnimeDataSource {
  return {
    search: async (filter) => {
      try {
        return await source.search(filter)
      } catch (error) {
        console.warn('[data-source] search 请求失败,回退 mock:', error)
        return mockSource.search(filter)
      }
    },
    getDetail: async (id) => {
      try {
        return await source.getDetail(id)
      } catch (error) {
        console.warn('[data-source] getDetail 请求失败,回退 mock:', error)
        return mockSource.getDetail(id)
      }
    },
    getEpisodes: async (id) => {
      try {
        return await source.getEpisodes(id)
      } catch (error) {
        console.warn('[data-source] getEpisodes 请求失败,回退 mock:', error)
        return mockSource.getEpisodes(id)
      }
    },
    getWeeklyCalendar: async () => {
      try {
        return await source.getWeeklyCalendar()
      } catch (error) {
        console.warn('[data-source] getWeeklyCalendar 请求失败,回退 mock:', error)
        return mockSource.getWeeklyCalendar()
      }
    },
  }
}

const preferMock = import.meta.env.VITE_DATA_SOURCE === 'mock'

export const animeDataSource: AnimeDataSource = preferMock
  ? mockSource
  : withFallback(bangumiSource)

export type { AnimeDataSource }
