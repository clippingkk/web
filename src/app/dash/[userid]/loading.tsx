import Spinner from '@/components/loading/spinner'

function DashboardLoadingPage() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Spinner />
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Loading…
      </span>
    </div>
  )
}

export default DashboardLoadingPage
