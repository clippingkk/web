import { Loader2 } from 'lucide-react'
import type React from 'react'

function Loading() {
  return (
    <div className="relative h-screen w-full bg-slate-100 dark:bg-slate-900">
      <div className="absolute top-0 right-0 bottom-0 left-0 h-full w-full animate-pulse opacity-30">
        {/* Skeleton for background gallery view */}
        <div className="grid h-full w-full grid-cols-4 gap-4 p-8 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-md bg-slate-300 dark:bg-slate-700"
            ></div>
          ))}
        </div>
      </div>

      <div
        className="absolute top-0 right-0 bottom-0 left-0 flex h-full w-full flex-col items-center justify-center"
        style={
          {
            '--start-color': 'oklch(45.08% 0.133 252.21 / 7.28%)',
            '--end-color': 'oklch(45.08% 0.133 252.21 / 77.28%)',
            backgroundImage:
              'radial-gradient(var(--start-color), var(--end-color))',
          } as React.CSSProperties
        }
      >
        <div className="flex h-full w-full items-center justify-center bg-slate-200/5 backdrop-blur-xs">
          <div className="flex w-full max-w-md flex-col items-center rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur-sm dark:bg-slate-800/40">
            <div className="w-full max-w-sm space-y-5">
              <div className="mx-auto h-10 w-48 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700"></div>

              <div className="mt-6 space-y-3">
                <div className="h-10 w-full animate-pulse rounded-md bg-slate-300 dark:bg-slate-700"></div>
                <div className="h-10 w-full animate-pulse rounded-md bg-slate-300 dark:bg-slate-700"></div>
                <div className="h-10 w-1/2 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700"></div>
              </div>

              <div className="mt-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading
