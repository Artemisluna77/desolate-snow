interface DegradedNoticeProps {
  show: boolean
}

/** 降级提示（GLOSSARY「降级快照」）：meta.source 非 live 时提示当前为本地快照数据。 */
export function DegradedNotice({ show }: DegradedNoticeProps) {
  if (!show) return null
  return <p className="age-degraded-notice">实时接口暂不可用，当前展示本地快照数据。</p>
}
