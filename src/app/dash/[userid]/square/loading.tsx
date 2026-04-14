function Loading() {
  return (
    <div className="w-full animate-pulse space-y-6">
      {/* Toolbar skeleton */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-700" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded-xl bg-gray-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Clippings grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {new Array(9).fill(1).map((_, i) => (
          <div
            key={i}
            className="relative space-y-4 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60"
          >
            <span
              aria-hidden
              className="absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-blue-300/40 to-transparent dark:from-blue-400/40"
            />
            {/* Book title placeholder */}
            <div className="h-3 w-32 rounded bg-gray-200 dark:bg-zinc-700" />
            {/* Body lines */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-700" />
            </div>
            {/* Creator footer placeholder */}
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-zinc-700" />
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-zinc-700" />
              </div>
              <div className="h-5 w-16 rounded-full bg-blue-100 dark:bg-blue-400/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loading
