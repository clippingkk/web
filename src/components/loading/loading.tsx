import React from 'react'
const styles = require('./style.css')

function _PageLoading() {
  return (
    <div className='bg-gray-100 dark:bg-gray-900 fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center anna-fade-in'>
      <div className='dark:bg-white bg-gray-900 bg-opacity-75 p-10 rounded shadow flex items-center justify-center'>
        <span>loading chunks...</span>
      </div>
    </div>
  )
}

function PageLoading() {
  return <div className={styles.loading}></div>
}

export default _PageLoading
