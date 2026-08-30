import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** AnimeCard 对应的加载占位 */
export function AnimeCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('block', className)}>
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-1.5 h-3 w-2/5" />
    </div>
  )
}
