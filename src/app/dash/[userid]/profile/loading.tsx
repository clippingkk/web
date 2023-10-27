import React from 'react'

type LoadingProps = {
}

function Loading(props: LoadingProps) {
  return (
    <div className='container mx-auto'>
      <div className='mt-12 w-full h-96 animate-pulse bg-gray-300 dark:bg-gray-800' />
      <div className='grid grid-cols-3 mt-16 mb-16 gap-6'>
        {new Array(6).fill(1).map((_, i) => (
          <div
            key={i}
            className='w-full h-96 animate-pulse bg-gray-300 dark:bg-gray-800'
          />
        ))}
      </div>
    </div>
  )
}

export default Loading
