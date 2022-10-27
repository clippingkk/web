import React from 'react'

function PageLoading() {
  return (
    <div className='bg-gray-100 dark:bg-gray-900 fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
      <div className='dark:bg-white bg-gray-900 bg-opacity-75 p-10 rounded shadow flex items-center justify-center'>
        <span>loading chunks...</span>
      </div>
    </div>
  )
}

export default PageLoading
