import Skeleton from '@annatarhe/lake-ui/skeleton'

import { ClippingGridSkeleton } from '@/components/clipping/clipping-card-skeleton'
import Page from '@/components/layout/page'

function Loading() {
  return (
    <Page width="default">
      <div aria-hidden="true" className="flex items-center gap-6">
        <Skeleton shape="circle" className="size-24" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton shape="text" className="h-7 w-48" />
          <Skeleton shape="text" className="w-32" />
          <Skeleton shape="text" className="w-2/3" />
        </div>
      </div>
      <Skeleton className="rounded-lake-panel h-20 w-full" />
      <ClippingGridSkeleton count={6} />
    </Page>
  )
}

export default Loading
