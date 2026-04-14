function Loading() {
  return (
    <section className="w-full animate-pulse space-y-8">
      {/* Profile card skeleton */}
      <div className="flex w-full flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/70">
          {/* Header band */}
          <div className="h-40 w-full bg-gradient-to-r from-blue-200/40 via-indigo-200/40 to-sky-200/40 dark:from-blue-400/15 dark:via-indigo-400/15 dark:to-sky-400/15" />

          <div className="-mt-14 px-6 pb-8 sm:px-8">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 dark:border-slate-900 dark:bg-zinc-700" />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-700" />
              <div className="h-5 w-20 rounded-full bg-blue-100 dark:bg-blue-400/20" />
            </div>

            <div className="mt-3 h-4 w-32 rounded bg-gray-200 dark:bg-zinc-700" />

            {/* Bio */}
            <div className="mt-6 space-y-2 rounded-xl border border-white/40 bg-white/60 p-4 dark:border-slate-800/40 dark:bg-slate-900/50">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-zinc-700" />
            </div>

            {/* Feature card row */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="h-20 rounded-xl bg-gray-200 dark:bg-zinc-700" />
              <div className="h-20 rounded-xl bg-gray-200 dark:bg-zinc-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity strip skeleton */}
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/70">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-400/20" />
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-zinc-700" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] gap-1">
            {new Array(182).fill(1).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded-sm bg-gray-200 dark:bg-zinc-700"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Clippings masonry skeleton */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-2">
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
              <div className="h-3 w-32 rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-700" />
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-zinc-700" />
                <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-zinc-700" />
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-700" />
              </div>
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
    </section>
  )
}

export default Loading
