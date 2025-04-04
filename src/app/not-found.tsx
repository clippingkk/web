import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'not found',
}

function NotFound() {
  // usePageTrack('notfound')
  return (
    <div className='flex justify-center items-center flex-col w-screen h-screen dark:bg-gray-800'>
      {/* <Head>
        <title>not found - clippingkk</title>
      </Head> */}
      <h1 className='text-6xl font-light dark:text-gray-200 mb-4'>
        404
      </h1>
      <h2 className='text-5xl font-bold text-gray-500'>
        Page Not Found
      </h2>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow-lg mt-4 hover:bg-blue-500 duration-150">
        Back To Home
      </Link>
    </div>
  )
}

export default NotFound
