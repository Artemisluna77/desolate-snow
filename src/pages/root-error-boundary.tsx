import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

import { Button } from '@/components/ui/button'

export function RootErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : '页面渲染出现问题'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl font-bold text-muted-foreground">
        {isRouteErrorResponse(error) ? error.status : '错误'}
      </p>
      <p className="text-base font-medium">{message}</p>
      <p className="text-sm text-muted-foreground">
        {isRouteErrorResponse(error) && error.status === 404
          ? '你访问的页面不存在。'
          : '请刷新重试,或返回首页。'}
      </p>
      <Button asChild>
        <Link to="/">返回首页</Link>
      </Button>
    </div>
  )
}
