import Skeleton from '@annatarhe/lake-ui/skeleton'

export function BookCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <Skeleton className="rounded-lake-control aspect-[2/3] w-full" />
      <Skeleton shape="text" className="w-4/5" />
      <Skeleton shape="text" className="w-1/2" />
    </div>
  )
}

export function BookShelfSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  )
}
