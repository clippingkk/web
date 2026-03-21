export default function CommentDetailLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back navigation skeleton */}
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

        {/* Main comment card skeleton */}
        <div className="rounded-3xl border border-white/50 bg-white/90 p-8 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div>
              <div className="mb-3 h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>

        {/* Related clipping skeleton */}
        <div>
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:border-blue-700/50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>

        {/* Author info skeleton */}
        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/40 dark:bg-gray-900/80">
          <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
