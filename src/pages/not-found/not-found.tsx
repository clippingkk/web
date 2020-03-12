import React from 'react'
import { Link } from '@reach/router'

const styles = require('./style.css')

function NotFound() {
  return (
    <div className={'w-full h-full flex justify-center items-center flex-col ' + styles.container}>
      <h1 className='text-6xl font-light'>
      404
      </h1>
      <h2 className='text-5xl font-bold text-gray-500'>
        Page Not Found
      </h2>
      <Link to="/" className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow-lg mt-4">Back To Home</Link>
    </div>
  )
}

export default NotFound
