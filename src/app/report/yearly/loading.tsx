import Skeleton from '@annatarhe/lake-ui/skeleton'

import { BookCardSkeleton } from '@/components/book/book-card-skeleton'
import Page from '@/components/layout/page'

function Loading() {
  return (
    <Page width="default" className="gap-12 md:gap-16">
      <div
        aria-hidden="true"
        className="border-lake-line flex flex-col gap-5 border-b pb-8"
      >
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="size-8" />
          <Skeleton shape="text" className="w-32" />
        </div>
        <Skeleton shape="text" className="w-28" />
        <Skeleton shape="text" className="h-10 w-full max-w-xl" />
        <Skeleton shape="text" className="w-2/3" />
      </div>
      <div aria-hidden="true">
        <Skeleton className="rounded-lake-panel h-28 w-full" />
      </div>
      <div
        aria-hidden="true"
        className="grid gap-6 sm:grid-cols-[8rem_minmax(0,1fr)] md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10"
      >
        <BookCardSkeleton />
        <div className="flex flex-col gap-4">
          <Skeleton shape="text" className="h-6 w-1/2" />
          <Skeleton shape="text" lines={4} />
        </div>
      </div>
    </Page>
  )
}

export default Loading
