export default function ContentLoading() {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Book title and author section skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-3/4 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 lg:h-12 dark:from-zinc-700 dark:to-zinc-600"></div>
        <div className="h-6 w-1/2 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 lg:h-7 dark:from-zinc-700 dark:to-zinc-600"></div>
      </div>

      {/* Elegant divider skeleton */}
      <div className="relative my-8 h-px overflow-hidden bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-zinc-700">
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Main content skeleton */}
      <div className="space-y-4 py-8">
        <div className="h-8 w-full rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
        <div className="h-8 w-full rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
        <div className="h-8 w-5/6 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
        <div className="h-8 w-4/5 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
      </div>

      {/* Elegant divider skeleton */}
      <div className="relative my-8 h-px overflow-hidden bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-zinc-700">
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"
          style={{ animationDuration: '3s', animationDelay: '1s' }}
        />
      </div>

      {/* Reactions skeleton */}
      <div className="flex gap-4 py-4">
        <div className="h-10 w-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
        <div className="h-10 w-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
        <div className="h-10 w-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
      </div>

      {/* Elegant divider skeleton */}
      <div className="relative my-8 h-px overflow-hidden bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-zinc-700">
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-gray-400/15 to-transparent"
          style={{ animationDuration: '3s', animationDelay: '2s' }}
        />
      </div>

      {/* Footer skeleton */}
      <footer className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
          <div className="h-5 w-32 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
        </div>
        <div className="h-5 w-40 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
      </footer>
    </div>
  )
}
