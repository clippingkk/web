export default function CommentDetailLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation skeleton */}
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />

        {/* Main comment card skeleton */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/50 dark:border-gray-700/50">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-3" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Related clipping skeleton */}
        <div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Author info skeleton */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-gray-700/40">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}