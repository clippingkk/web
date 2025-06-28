export default function ContentLoading() {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Book title and author section skeleton */}
      <div className="space-y-3">
        <div className="h-8 lg:h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-3/4"></div>
        <div className="h-6 lg:h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-1/2"></div>
      </div>

      {/* Elegant divider skeleton */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent" />

      {/* Main content skeleton */}
      <div className="py-8 space-y-4">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-full"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-full"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-5/6"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-4/5"></div>
      </div>

      {/* Divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent" />

      {/* Reactions skeleton */}
      <div className="py-4 flex gap-4">
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
      </div>

      {/* Divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent" />

      {/* Footer skeleton */}
      <footer className="pt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full"></div>
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-32"></div>
        </div>
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-40"></div>
      </footer>
    </div>
  )
}