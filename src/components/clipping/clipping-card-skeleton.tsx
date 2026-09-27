import Skeleton from '@annatarhe/lake-ui/skeleton'

import { cn } from '@/lib/utils'

type ClippingCardSkeletonProps = {
  lines?: number
  className?: string
}

export function ClippingCardSkeleton({
  lines = 4,
  className,
}: ClippingCardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-lake-panel border-lake-line bg-lake-surface flex flex-col gap-4 border p-5',
        className
      )}
    >
      <Skeleton shape="text" className="w-1/3" />
      <Skeleton shape="text" lines={lines} />
      <Skeleton shape="text" className="w-1/4" />
    </div>
  )
}

export function ClippingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ClippingCardSkeleton key={i} lines={3 + (i % 3)} />
      ))}
    </div>
  )
}
