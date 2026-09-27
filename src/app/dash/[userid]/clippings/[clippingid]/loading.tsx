import Skeleton from '@annatarhe/lake-ui/skeleton'

import Page from '@/components/layout/page'

function Loading() {
  return (
    <Page width="wide">
      <div
        aria-hidden="true"
        className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16"
      >
        <div className="flex max-w-3xl flex-col gap-6">
          <Skeleton shape="text" className="w-24" />
          <Skeleton shape="text" className="h-6 w-1/2" />
          <Skeleton shape="text" lines={6} className="mt-4" />
          <Skeleton shape="text" className="w-48" />
        </div>
        <Skeleton className="rounded-lake-panel hidden h-72 lg:block" />
      </div>
    </Page>
  )
}

export default Loading
