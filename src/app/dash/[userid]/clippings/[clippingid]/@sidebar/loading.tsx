export default function SidebarLoading() {
  return (
    <aside className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="animate-pulse space-y-6">
        {/* Book Info Card Skeleton */}
        <div className="relative rounded-2xl border border-gray-200/50 bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/50">
          <div className="flex items-start gap-4">
            <div className="h-24 w-16 rounded-lg bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
              <div className="h-3 w-2/3 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
              <div className="mt-2 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-3 w-3 rounded-full bg-gray-300 dark:bg-zinc-600"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary Featured Section Skeleton */}
        <div className="mb-6">
          <div className="relative animate-pulse overflow-hidden rounded-2xl bg-gradient-to-br from-purple-200 via-violet-200 to-indigo-300 p-6 shadow-lg dark:from-purple-800 dark:via-violet-800 dark:to-indigo-900">
            {/* Sparkle effects skeleton */}
            <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-white/30"></div>
            <div className="absolute bottom-4 left-4 h-4 w-4 rounded-full bg-white/20"></div>

            {/* Main content skeleton */}
            <div className="flex items-center gap-4">
              {/* Icon container skeleton */}
              <div className="h-14 w-14 rounded-xl bg-white/20 p-3"></div>

              {/* Text content skeleton */}
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 rounded bg-white/30"></div>
                <div className="h-5 w-24 rounded bg-white/40"></div>
                <div className="h-3 w-32 rounded bg-white/30"></div>
              </div>

              {/* Arrow skeleton */}
              <div className="h-5 w-5 rounded bg-white/30"></div>
            </div>

            {/* Bottom gradient line skeleton */}
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/40"></div>
          </div>
        </div>

        {/* Quick Actions Section Skeleton */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-400"></div>
            <div className="h-3 w-20 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
            <div className="h-10 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
            <div className="h-10 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
            <div className="h-10 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
            <div className="via-gray-250 dark:via-zinc-650 col-span-2 h-10 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
          </div>
        </div>

        {/* Navigation Section Skeleton */}
        <div className="relative rounded-2xl border border-gray-200/30 bg-white/30 p-4 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/30">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-purple-400"></div>
            <div className="h-3 w-16 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
          </div>
          <div className="space-y-2">
            {/* Navigation card skeleton */}
            <div className="rounded-xl border border-gray-200/40 bg-white/40 p-3 backdrop-blur-sm dark:border-zinc-700/40 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-200 to-emerald-300 p-2 dark:from-emerald-700 dark:to-emerald-600"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-12 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                  <div className="h-3 w-20 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                </div>
                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-zinc-700"></div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/40 bg-white/40 p-3 backdrop-blur-sm dark:border-zinc-700/40 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-200 to-teal-300 p-2 dark:from-teal-700 dark:to-teal-600"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-8 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                  <div className="h-3 w-16 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                </div>
                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-zinc-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
