export default function CommentsLoading() {
  return (
    <div className="mb-8 w-full">
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* Subtle texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.02]">
          <svg width="100%" height="100%">
            <pattern
              id="comments-loading-texture"
              x="0"
              y="0"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r="0.5"
                fill="currentColor"
                className="text-gray-900 dark:text-white"
              />
            </pattern>
            <rect
              width="100%"
              height="100%"
              fill="url(#comments-loading-texture)"
            />
          </svg>
        </div>

        {/* Main container with gradient background */}
        <div className="relative border border-gray-200/80 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 shadow-sm backdrop-blur-sm dark:border-zinc-800/60 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-blue-900/10">
          {/* Header with enhanced gradient */}
          <div className="relative border-b border-gray-200/60 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 p-6 backdrop-blur-sm dark:border-zinc-800/50 dark:from-zinc-800/90 dark:via-blue-900/20 dark:to-indigo-900/10">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 dark:from-blue-400/10 dark:to-indigo-400/10" />

            <div className="relative flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 p-2 shadow-sm shadow-blue-400/20 dark:from-blue-400 dark:to-blue-500 dark:shadow-blue-400/20">
                <div className="h-5 w-5 animate-pulse rounded bg-white"></div>
              </div>
              <div className="h-6 w-32 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
            </div>
          </div>

          <div className="relative space-y-6 p-6">
            {/* Comment input skeleton with gradient shimmer */}
            <div className="border-b border-gray-100/50 pb-6 dark:border-zinc-800/50">
              <div className="flex animate-pulse gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2">
                    <div className="h-4 w-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                  </div>
                  <div className="rounded-xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50 p-4 dark:border-zinc-700/50 dark:from-zinc-800 dark:to-zinc-800/50">
                    <div className="h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600"></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="h-4 w-32 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                    <div className="h-8 w-20 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments skeleton with gradient effects */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex animate-pulse gap-4 rounded-xl p-4"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2">
                      <div className="h-4 w-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                    </div>
                    <div className="rounded-xl border border-gray-200/30 bg-gradient-to-br from-gray-100/80 to-gray-200/50 p-4 backdrop-blur-sm dark:border-zinc-700/30 dark:from-zinc-800/80 dark:to-zinc-700/30">
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                        <div className="h-4 w-5/6 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                        <div className="h-4 w-4/5 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
