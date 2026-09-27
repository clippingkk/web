import Skeleton from '@annatarhe/lake-ui/skeleton'

function SettingsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <Skeleton shape="text" className="h-6 w-40" />
      <Skeleton shape="text" className="w-2/3" />
      <Skeleton className="rounded-lake-panel h-40 w-full" />
    </div>
  )
}

export default SettingsSkeleton
