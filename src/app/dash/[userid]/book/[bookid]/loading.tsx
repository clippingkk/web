import Skeleton from '@annatarhe/lake-ui/skeleton'

import { ClippingGridSkeleton } from '@/components/clipping/clipping-card-skeleton'
import Page from '@/components/layout/page'

function Loading() {
  return (
    <Page width="wide">
      <div
        aria-hidden="true"
        className="border-lake-line grid gap-8 border-b pb-10 sm:grid-cols-[10rem_1fr] md:grid-cols-[13rem_1fr] md:gap-12"
      >
        <Skeleton className="rounded-lake-control aspect-[2/3] w-36 sm:w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton shape="text" className="h-10 w-3/4" />
          <Skeleton shape="text" className="w-1/2" />
          <Skeleton shape="text" lines={4} />
        </div>
      </div>
      <ClippingGridSkeleton />
    </Page>
  )
}

export default Loading
