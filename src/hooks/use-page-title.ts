import { useEffect } from 'react'

/** 设置当前页面标题,卸载时恢复默认 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - AGE动漫复刻`
    return () => {
      document.title = 'AGE动漫复刻'
    }
  }, [title])
}
