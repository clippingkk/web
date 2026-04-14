export function BooksSkeleton() {
  return (
    <div className="mt-12 mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {new Array(6).fill(1).map((_, i) => (
        <div
          key={i}
          className="h-96 w-full animate-pulse rounded-2xl border border-white/40 bg-gradient-to-br from-blue-400/10 via-slate-200/60 to-indigo-400/10 backdrop-blur-xl dark:border-slate-800/40 dark:from-blue-400/5 dark:via-slate-800/50 dark:to-indigo-400/5"
        />
      ))}
    </div>
  )
}

function HomePageSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="mt-8 h-96 w-full animate-pulse rounded-2xl border border-white/40 bg-gradient-to-br from-blue-400/10 via-slate-200/60 to-indigo-400/10 backdrop-blur-xl dark:border-slate-800/40 dark:from-blue-400/5 dark:via-slate-800/50 dark:to-indigo-400/5" />
      <div className="mt-10 h-24 w-full animate-pulse rounded-2xl border border-white/40 bg-slate-200/60 backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-800/60" />
      <BooksSkeleton />
    </div>
  )
}

export default HomePageSkeleton
