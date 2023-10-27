import React from 'react'

function Loading() {
  return (
    <div className='container w-full mt-4 lg:mt-20'>
      <div className='flex w-full h-156 gap-6'>
        <div className='h-full flex-1 animate-pulse bg-slate-400 rounded-sm' />
        <div className='w-96 animate-pulse h-full bg-slate-400 rounded-sm' />
      </div>
      <div className='w-full h-64 mt-12 mb-8 animate-pulse bg-slate-400 rounded-sm' />
    </div>
  )
}

export default Loading
