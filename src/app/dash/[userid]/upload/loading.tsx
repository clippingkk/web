import Skeleton from '@annatarhe/lake-ui/skeleton'

import Page from '@/components/layout/page'
import PageHeaderSkeleton from '@/components/layout/page-header-skeleton'

function Loading() {
  return (
    <Page width="reading">
      <PageHeaderSkeleton />
      <Skeleton className="rounded-lake-panel h-40 w-full" />
      <Skeleton className="rounded-lake-control h-10 w-56" />
    </Page>
  )
}

export default Loading
