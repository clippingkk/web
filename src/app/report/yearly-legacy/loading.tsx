import React from 'react'

function Loading() {
  return (
    <div className='container mx-auto'>
      <div className='grid grid-cols-3 mt-32 mb-16 gap-6'>
        {new Array(6).fill(1).map((_, i) => (
          <div
            key={i}
            className='w-full h-96 animate-pulse bg-slate-400 dark:bg-slate-800'
          />
        ))}
      </div>
      <div className='w-full flex flex-col items-center justify-center'>
        <div className='rounded-full w-32 h-32 bg-slate-400 dark:bg-slate-800 animate-pulse' />
        <div className='w-96 h-12 mt-4 animate-pulse bg-slate-400 dark:bg-slate-800' />
      </div>
    </div>
  )
}

export default Loading
