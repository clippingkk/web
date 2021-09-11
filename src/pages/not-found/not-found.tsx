import React from 'react'
import Link from 'next/link'
import { usePageTrack } from '../../hooks/tracke'

import styles from './style.module.css'

function NotFound() {
  usePageTrack('notfound')
  return (
    <div className={'w-full h-full flex justify-center items-center flex-col ' + styles.container}>
      <h1 className='text-6xl font-light'>
        404
      </h1>
      <h2 className='text-5xl font-bold text-gray-500'>
        Page Not Found
      </h2>
      <Link
        href="/"
      >
        <a
          className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow-lg mt-4"
        >
          Back To Home
        </a>
      </Link>
    </div>
  )
}

export default NotFound
