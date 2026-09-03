import { useEffect, useState } from 'react'

/** 滚动超过该距离(像素)后显示按钮。 */
const SHOW_THRESHOLD = 300

/**
 * 全局回到顶部按钮,对齐 AGE 官方的 side-tools-gototop:
 * 滚动一段距离后出现在内容区右侧,点击平滑回顶。
 */
export function Backtop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={visible ? 'age-backtop is-visible' : 'age-backtop'}
      aria-label="回到顶部"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    />
  )
}
