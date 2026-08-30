import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  action?: ReactNode
}

export function ErrorState({
  title = '加载失败',
  message = '请求出现问题,请稍后重试。',
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-base font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action ?? null}
    </div>
  )
}

/** 带重试按钮的错误态,onClick 由 TanStack Query 的 refetch 提供 */
export function RetryErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          重试
        </Button>
      }
    />
  )
}
