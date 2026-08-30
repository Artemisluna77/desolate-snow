import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
}

interface FilterGroupProps {
  label: string
  options: FilterOption[]
  /** 当前选中值,'all' 表示不限 */
  value: string
  onChange: (value: string) => void
  className?: string
}

/** 单选标签组:目录页筛选栏的基础控件 */
export function FilterGroup({ label, options, value, onChange, className }: FilterGroupProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="w-14 shrink-0 pt-1.5 text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={option.value === value}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs transition-colors',
              option.value === value
                ? 'bg-primary font-medium text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
