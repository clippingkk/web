function BookPageSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Book info hero section skeleton */}
      <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-[280px,1fr] lg:grid-cols-[320px,1fr] lg:gap-10 lg:py-8">
        {/* Book cover skeleton */}
        <div className="mx-auto w-full max-w-[320px]">
          <div className="aspect-[4/5] w-full rounded-xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 shadow-sm dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700" />
          {/* Mobile share button skeleton */}
          <div className="mt-6 md:hidden">
            <div className="h-12 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600" />
          </div>
        </div>

        {/* Book details skeleton */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-1/3 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600" />
              <div className="h-6 w-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600" />
            </div>
            {/* Tags skeleton */}
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-16 rounded-full bg-gray-200 dark:bg-zinc-700"
                />
              ))}
            </div>
          </div>

          {/* Stats bar skeleton */}
          <div className="flex flex-wrap gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-gray-200/40 bg-white/40 px-4 py-3 dark:border-zinc-700/40 dark:bg-zinc-800/40"
              >
                <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-zinc-700" />
                <div className="space-y-1">
                  <div className="h-5 w-12 rounded bg-gray-200 dark:bg-zinc-700" />
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>

          {/* Share button skeleton (desktop) */}
          <div className="hidden md:block">
            <div className="h-10 w-32 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600" />
          </div>

          {/* Meta section skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-gray-200/40 bg-white/40 p-3 dark:border-zinc-700/40 dark:bg-zinc-800/40"
              >
                <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-zinc-700" />
                <div className="space-y-1">
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-zinc-700" />
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className="space-y-3 rounded-xl border border-gray-200/40 bg-white/40 p-6 dark:border-zinc-700/40 dark:bg-zinc-800/40">
            <div className="h-6 w-24 rounded bg-gray-200 dark:bg-zinc-700" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-zinc-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Divider skeleton */}
      <div className="relative my-8 h-px overflow-hidden bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-zinc-700">
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-blue-400/25 to-transparent"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-700" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 rounded-xl bg-gray-200 dark:bg-zinc-700" />
          <div className="h-9 w-20 rounded-xl bg-gray-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Clippings grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {new Array(6).fill(1).map((_, i) => (
          <div
            key={i}
            className="relative space-y-4 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60"
          >
            <span
              aria-hidden
              className="absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-blue-300/40 to-transparent dark:from-blue-400/40"
            />
            <div className="flex items-center justify-between">
              <div className="h-5 w-14 rounded-full bg-blue-100 dark:bg-blue-400/20" />
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-zinc-700" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookPageSkeleton
