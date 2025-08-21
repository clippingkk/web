import { Loader2 } from 'lucide-react'
import type React from 'react'

function Loading() {
  return (
    <div className='w-full h-screen bg-slate-100 dark:bg-slate-900 relative'>
      <div className='w-full h-full absolute top-0 left-0 right-0 bottom-0 animate-pulse opacity-30'>
        {/* Skeleton for background gallery view */}
        <div className='w-full h-full grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-8'>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className='aspect-[2/3] bg-slate-300 dark:bg-slate-700 rounded-md'
            ></div>
          ))}
        </div>
      </div>

      <div
        className='absolute top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col justify-center items-center'
        style={
          {
            '--start-color': 'oklch(45.08% 0.133 252.21 / 7.28%)',
            '--end-color': 'oklch(45.08% 0.133 252.21 / 77.28%)',
            backgroundImage:
              'radial-gradient(var(--start-color), var(--end-color))',
          } as React.CSSProperties
        }
      >
        <div className='w-full h-full bg-slate-200/5 backdrop-blur-xs flex justify-center items-center'>
          <div className='bg-white/10 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl flex flex-col items-center'>
            <div className='w-full max-w-sm space-y-5'>
              <div className='h-10 w-48 bg-slate-300 dark:bg-slate-700 rounded-md mx-auto animate-pulse'></div>

              <div className='space-y-3 mt-6'>
                <div className='h-10 w-full bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse'></div>
                <div className='h-10 w-full bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse'></div>
                <div className='h-10 w-1/2 bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse'></div>
              </div>

              <div className='flex justify-center mt-8'>
                <Loader2 className='h-8 w-8 animate-spin text-slate-700 dark:text-slate-300' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading
