import Skeleton from '@annatarhe/lake-ui/skeleton'

import Page from '@/components/layout/page'
import PageHeaderSkeleton from '@/components/layout/page-header-skeleton'

function Loading() {
  return (
    <Page width="reading">
      <PageHeaderSkeleton />
      <div aria-hidden="true" className="flex flex-col gap-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton shape="text" className="w-40" />
            <Skeleton shape="text" lines={3} />
          </div>
        ))}
      </div>
    </Page>
  )
}

export default Loading
