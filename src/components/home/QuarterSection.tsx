import type { ReactNode } from 'react'

interface QuarterSectionProps<T> {
  quarter: string
  year: number
  items: T[]
  renderItem: (item: T, isFirst: boolean) => ReactNode
  idPrefix?: string
  isFirstGroup: boolean
}

export function QuarterSection<T>({
  quarter,
  year,
  items,
  renderItem,
  idPrefix = 'quarter',
  isFirstGroup,
}: QuarterSectionProps<T>) {
  return (
    <div id={`${idPrefix}-${quarter.toLowerCase()}-${year}`} className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-fluid-2xs font-bold text-[var(--gray-600)] tracking-widest">
          {quarter} {year}
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <div className="space-y-5">
        {items.map((item, index) => renderItem(item, isFirstGroup && index === 0))}
      </div>
    </div>
  )
}
