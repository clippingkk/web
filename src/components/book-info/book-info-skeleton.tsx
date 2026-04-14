function StatSkeleton() {
  return (
    <div className="flex min-w-[180px] items-center gap-4 rounded-3xl border border-white/60 bg-white/75 px-4 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
      <div className="h-11 w-11 rounded-2xl bg-slate-200/90 dark:bg-slate-700/80" />
      <div className="space-y-2">
        <div className="h-5 w-16 rounded-full bg-slate-200/90 dark:bg-slate-700/80" />
        <div className="h-3 w-24 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
      </div>
    </div>
  )
}

function MetaSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/75 p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
      <div className="h-12 w-12 rounded-2xl bg-slate-200/90 dark:bg-slate-700/80" />
      <div className="space-y-2">
        <div className="h-3 w-16 rounded-full bg-slate-200/70 dark:bg-slate-700/60" />
        <div className="h-5 w-24 rounded-full bg-slate-200/90 dark:bg-slate-700/80" />
      </div>
    </div>
  )
}

function BookInfoSkeleton() {
  return (
    <section className="relative animate-pulse overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(240,249,255,0.92),rgba(255,255,255,0.88))] p-6 shadow-[0_30px_80px_-45px_rgba(14,116,144,0.5)] ring-1 ring-slate-200/60 md:p-8 lg:p-10 dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(12,74,110,0.55),rgba(30,41,59,0.92))] dark:ring-slate-700/50">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-cyan-200/40 via-sky-100/30 to-transparent blur-3xl dark:from-cyan-400/10 dark:via-sky-400/10" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(260px,320px)_1fr] md:gap-10 lg:gap-12">
        <div className="mx-auto w-full max-w-[320px]">
          <div className="relative">
            <div className="absolute inset-4 rounded-[2rem] bg-cyan-200/45 blur-3xl dark:bg-cyan-500/15" />
            <div className="relative aspect-[4/5] rounded-[1.75rem] bg-gradient-to-br from-slate-200 via-slate-100 to-cyan-100 shadow-[0_35px_80px_-35px_rgba(14,116,144,0.45)] dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
          </div>

          <div className="mt-6 h-12 rounded-2xl bg-slate-200/90 md:hidden dark:bg-slate-700/80" />
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-12 w-4/5 rounded-2xl bg-slate-200/90 dark:bg-slate-700/80" />
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-7 w-40 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
              <div className="h-8 w-24 rounded-full bg-amber-100 dark:bg-amber-400/20" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-20 rounded-full bg-slate-200/70 dark:bg-slate-700/60"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <StatSkeleton key={index} />
            ))}
          </div>

          <div className="hidden h-11 w-36 rounded-2xl bg-slate-200/90 md:block dark:bg-slate-700/80" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetaSkeleton />
            <MetaSkeleton />
          </div>

          <div className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
            <div className="mb-5 h-6 w-32 rounded-full bg-slate-200/90 dark:bg-slate-700/80" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
              <div className="h-4 w-11/12 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
              <div className="h-4 w-10/12 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
              <div className="h-4 w-3/4 rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BookInfoSkeleton
