import React from 'react'
import LoadingIcon from './icons/loading.svg'

type WithLoadingProps = {
  loading: boolean
  children: React.ReactElement
}

function WithLoading(props: WithLoadingProps) {
  return (
    <div className=' relative w-full'>
      {props.children}
      {props.loading && (
        <div className='flex w-full h-full absolute inset-0 bg-black bg-opacity-50 justify-center items-center backdrop-blur-sm with-fade-in'>
          <LoadingIcon className='animate-spin' />
          <span className='dark:text-white text-sm ml-4'>Submitting...</span>
        </div>
      )}
    </div>
  )
}

export default WithLoading
