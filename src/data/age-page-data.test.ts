import { describe, expect, it } from 'vitest'

import { AGE_DETAIL_RECOMMENDATIONS, getAgeDetail, getAgeRecommendations, RECOMMENDATION_COUNT } from './age-page-data'
import type { AgeUpdateItem } from '@/types/agedm'

/** 线路域契约（GLOSSARY「线路」）：无论 live 还是降级快照，sources 恒非空且形状一致。 */
describe('线路域契约', () => {
  it('降级快照：getAgeDetail 产出非空 sources', () => {
    for (const id of [20260170, 20260066, 1, 99999999]) {
      const detail = getAgeDetail(id)
      expect(detail.sources.length).toBeGreaterThan(0)
    }
  })

  it('降级快照：线路使用中性命名，不冒充真实品牌', () => {
    const detail = getAgeDetail(20260066)
    for (const source of detail.sources) {
      expect(source.label).toMatch(/^线路 \d+$/)
      expect(source.isVip).toBe(false)
    }
  })

  it('每条线路的分集编号严格从 1 连续递增，且数量与 episodeCount 一致', () => {
    const detail = getAgeDetail(20260066)
    expect(detail.episodeCount).toBeGreaterThan(0)
    for (const source of detail.sources) {
      expect(source.episodes.map((episode) => episode.number)).toEqual(
        Array.from({ length: detail.episodeCount }, (_, index) => index + 1),
      )
    }
  })
})

/** 推荐补位契约（GLOSSARY）：上游优先，本地池去重补足 12 条。 */
describe('推荐补位契约', () => {
  const upstream: AgeUpdateItem[] = AGE_DETAIL_RECOMMENDATIONS.slice(0, 6)

  it('上游不足 12 条时用本地池去重补足', () => {
    const result = getAgeRecommendations(upstream)
    expect(result).toHaveLength(RECOMMENDATION_COUNT)
    expect(result.slice(0, 6)).toEqual(upstream)
  })

  it('去重：本地池不重复推荐已有条目', () => {
    const result = getAgeRecommendations(upstream)
    const ids = new Set(result.map((item) => item.id))
    expect(ids.size).toBe(result.length)
  })

  it('上游已满 12 条时原样截断，顺序不变', () => {
    const result = getAgeRecommendations(AGE_DETAIL_RECOMMENDATIONS)
    expect(result).toHaveLength(RECOMMENDATION_COUNT)
    expect(result).toEqual(AGE_DETAIL_RECOMMENDATIONS.slice(0, RECOMMENDATION_COUNT))
  })
})
