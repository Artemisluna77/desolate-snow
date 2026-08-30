import { useEffect } from 'react'

/** 设置当前页面标题,卸载时恢复默认 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - AGE动漫`
    return () => {
      document.title = 'AGE动漫 - 在线动漫观看'
    }
  }, [title])
}
