import { ChevronRight, Sparkles } from 'lucide-react'

function Loading() {
  return (
    <div className="relative w-full">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-400/20 opacity-30 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/2 h-64 w-64 rounded-full bg-indigo-400/20 opacity-30 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Header section skeleton */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-300" />
            <div className="h-5 w-30 animate-pulse rounded-xl bg-slate-200/60 dark:bg-slate-800/60"></div>
          </div>

          <div className="mx-auto mb-6 h-15 max-w-xl animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
          <div className="mx-auto mb-2 h-6 max-w-3xl animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
          <div className="mx-auto h-6 max-w-2xl animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
        </div>

        {/* Pricing cards skeleton */}
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
          {/* Decorative arrow */}
          <div className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 transform lg:block">
            <ChevronRight className="h-12 w-12 text-blue-500/50 dark:text-blue-300/50" />
          </div>

          {/* Free plan card skeleton */}
          <div className="flex flex-col rounded-2xl border border-white/40 bg-white/60 p-8 backdrop-blur-md transition-colors dark:border-slate-800/40 dark:bg-slate-900/60">
            <div className="mb-3 h-9 w-36 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
            <div className="mb-6 h-5 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>

            <div className="mb-8 flex-grow space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="mr-3 h-6 w-6 animate-pulse rounded-full bg-slate-200/60 dark:bg-slate-800/60"></div>
                  <div className="h-5 flex-grow animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
                </div>
              ))}
            </div>

            <div className="h-12 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
          </div>

          {/* Premium plan card skeleton */}
          <div className="flex flex-col rounded-2xl border border-white/40 bg-white/60 p-8 backdrop-blur-md transition-colors dark:border-slate-800/40 dark:bg-slate-900/60">
            <div className="mb-3 h-9 w-44 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
            <div className="mb-6 h-5 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>

            <div className="mb-8 flex-grow space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="mr-3 h-6 w-6 animate-pulse rounded-full bg-slate-200/60 dark:bg-slate-800/60"></div>
                  <div className="h-5 flex-grow animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
                </div>
              ))}
            </div>

            <div className="h-12 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
          </div>
        </div>

        {/* FAQ section skeleton */}
        <div className="mt-24 text-center">
          <div className="mx-auto mb-10 max-w-md border-t border-slate-200/70 dark:border-slate-800/60" />
          <div className="mx-auto h-5 w-72 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"></div>
        </div>
      </div>
    </div>
  )
}

export default Loading
