import React from 'react'

type LoadingProps = {
}

function Loading(props: LoadingProps) {
  return (
    <div className='container mx-auto flex justify-around items-center my-auto h-screen'>
      <div>
        <div className='w-96 h-12 animate-pulse bg-slate-400 dark:bg-slate-800'  />
        <div className='w-144 mt-12 h-8 animate-pulse bg-slate-400 dark:bg-slate-800'  />
      </div>
      <div className='w-128 h-128 animate-pulse bg-slate-400 dark:bg-slate-800' />
    </div>
  )
}

export default Loading
