import Skeleton from '@annatarhe/lake-ui/skeleton'

import Page from '@/components/layout/page'
import PageHeaderSkeleton from '@/components/layout/page-header-skeleton'

function Loading() {
  return (
    <Page width="reading">
      <PageHeaderSkeleton />
      <div aria-hidden="true" className="flex flex-col gap-8">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton shape="text" className="h-5 w-1/2" />
            <Skeleton shape="text" lines={2} />
          </div>
        ))}
      </div>
    </Page>
  )
}

export default Loading
