import type React from 'react'

import LoadingIcon from './icons/loading.svg'

type WithLoadingProps = {
  loading: boolean
  disabled?: boolean
  children: React.ReactElement
}

function WithLoading(props: WithLoadingProps) {
  return (
    <div className="relative w-full">
      {props.children}
      {props.loading && (
        <div className="bg-opacity-50 with-fade-in absolute inset-0 flex h-full w-full items-center justify-center bg-black backdrop-blur-xs">
          <LoadingIcon className="animate-spin" />
          <span className="ml-4 text-sm dark:text-white">Submitting...</span>
        </div>
      )}
      {props.disabled ? (
        <div className="bg-opacity-50 with-fade-in absolute inset-0 flex h-full w-full items-center justify-center bg-black backdrop-blur-xs">
          <span className="ml-4 text-sm dark:text-white">Unavailable</span>
        </div>
      ) : null}
    </div>
  )
}

export default WithLoading
