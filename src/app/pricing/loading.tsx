import Skeleton from '@annatarhe/lake-ui/skeleton'

import Page from '@/components/layout/page'

function PlanSkeleton() {
  return (
    <div className="rounded-lake-panel border-lake-line bg-lake-surface flex flex-col gap-6 border p-6">
      <div className="flex flex-col gap-3">
        <Skeleton shape="text" className="h-7 w-32" />
        <Skeleton shape="text" className="w-3/4" />
        <Skeleton shape="text" className="w-24" />
      </div>
      <div className="border-lake-line border-t pt-5">
        <Skeleton shape="text" lines={6} />
      </div>
      <Skeleton className="rounded-lake-control h-11 w-full" />
    </div>
  )
}

function Loading() {
  return (
    <Page width="default" className="gap-14 md:py-20">
      <div
        aria-hidden="true"
        className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4"
      >
        <Skeleton shape="text" className="w-20" />
        <Skeleton shape="text" className="h-10 w-full max-w-lg" />
        <Skeleton shape="text" className="w-2/3" />
      </div>
      <div aria-hidden="true" className="grid gap-6 md:grid-cols-2">
        <PlanSkeleton />
        <PlanSkeleton />
      </div>
    </Page>
  )
}

export default Loading
