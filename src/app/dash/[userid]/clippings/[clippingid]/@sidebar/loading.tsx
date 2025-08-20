export default function SidebarLoading() {
  return (
    <aside className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="space-y-6 animate-pulse">
        {/* Book Info Card Skeleton */}
        <div className="relative bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-zinc-700/50 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-16 h-24 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-full"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-2/3"></div>
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary Featured Section Skeleton */}
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-200 via-violet-200 to-indigo-300 dark:from-purple-800 dark:via-violet-800 dark:to-indigo-900 p-6 shadow-lg animate-pulse">
            {/* Sparkle effects skeleton */}
            <div className="absolute top-4 right-4 w-6 h-6 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/20 rounded-full"></div>

            {/* Main content skeleton */}
            <div className="flex items-center gap-4">
              {/* Icon container skeleton */}
              <div className="bg-white/20 rounded-xl p-3 w-14 h-14"></div>

              {/* Text content skeleton */}
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/30 rounded w-20"></div>
                <div className="h-5 bg-white/40 rounded w-24"></div>
                <div className="h-3 bg-white/30 rounded w-32"></div>
              </div>

              {/* Arrow skeleton */}
              <div className="w-5 h-5 bg-white/30 rounded"></div>
            </div>

            {/* Bottom gradient line skeleton */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40"></div>
          </div>
        </div>

        {/* Quick Actions Section Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
            <div className="col-span-2 h-10 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg"></div>
          </div>
        </div>

        {/* Navigation Section Skeleton */}
        <div className="relative bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30 dark:border-zinc-700/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            {/* Navigation card skeleton */}
            <div className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-200/40 dark:border-zinc-700/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-600 rounded-lg w-8 h-8"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-12"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-20"></div>
                </div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
            </div>
            <div className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-200/40 dark:border-zinc-700/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-200 to-teal-300 dark:from-teal-700 dark:to-teal-600 rounded-lg w-8 h-8"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-8"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-16"></div>
                </div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
