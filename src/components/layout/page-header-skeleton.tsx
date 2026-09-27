import Skeleton from '@annatarhe/lake-ui/skeleton'

function PageHeaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-lake-line flex flex-col gap-3 border-b pb-6"
    >
      <Skeleton shape="text" className="w-24" />
      <Skeleton shape="text" className="h-8 w-2/3 max-w-md" />
      <Skeleton shape="text" className="w-40" />
    </div>
  )
}

export default PageHeaderSkeleton
