export default function CommentsLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="mb-2 h-10 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Stats skeleton */}
        <div className="mb-6 rounded-2xl border border-white/40 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/40 dark:bg-gray-900/80">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>

        {/* Comments grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/40 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/40 dark:bg-gray-900/80"
            >
              <div className="space-y-3">
                <div>
                  <div className="mb-2 h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-3/5 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
