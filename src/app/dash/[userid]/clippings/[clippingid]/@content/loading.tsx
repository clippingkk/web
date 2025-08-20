export default function ContentLoading() {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Book title and author section skeleton */}
      <div className="space-y-3">
        <div className="h-8 lg:h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-3/4"></div>
        <div className="h-6 lg:h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-1/2"></div>
      </div>

      {/* Elegant divider skeleton */}
      <div className="relative h-px my-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Main content skeleton */}
      <div className="py-8 space-y-4">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-full"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-full"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-5/6"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-4/5"></div>
      </div>

      {/* Elegant divider skeleton */}
      <div className="relative h-px my-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-pulse"
          style={{ animationDuration: '3s', animationDelay: '1s' }}
        />
      </div>

      {/* Reactions skeleton */}
      <div className="py-4 flex gap-4">
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
      </div>

      {/* Elegant divider skeleton */}
      <div className="relative h-px my-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/15 to-transparent animate-pulse"
          style={{ animationDuration: '3s', animationDelay: '2s' }}
        />
      </div>

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
