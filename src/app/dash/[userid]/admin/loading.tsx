import Skeleton from '@annatarhe/lake-ui/skeleton'

import Page from '@/components/layout/page'
import PageHeaderSkeleton from '@/components/layout/page-header-skeleton'

function Loading() {
  return (
    <Page width="default">
      <PageHeaderSkeleton />
      <Skeleton className="rounded-lake-panel h-64 w-full" />
    </Page>
  )
}

export default Loading
