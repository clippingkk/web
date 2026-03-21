import Loading2Icon from '@/components/icons/loading2.svg'

function DashboardLoadingPage() {
  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
      <Loading2Icon />
      <span className="mt-4 dark:text-gray-100">Loading...</span>
    </div>
  )
}

export default DashboardLoadingPage
