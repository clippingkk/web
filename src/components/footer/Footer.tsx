import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import React from 'react'

function ICPInfo() {
  return (
    <a
      href="http://www.miitbeian.gov.cn/"
      target="_blank"
      className='no-underline text-black dark:text-gray-300' rel="noreferrer"
    >
      豫ICP备15003571号
    </a>
  )
}

function Footer() {
  return (
    <footer className='flex items-center justify-around md:p-20 p-4 bg-gray-200 dark:bg-gray-700'>
      <div className='no-underline text-black dark:text-gray-300'>
        <p>
          Build with ❤ by AnnatarHe
        </p>
        <p>Version: {(process as any).env.GIT_COMMIT}</p>
        <p>
          Host on
          <a
            href="https://www.leancloud.cn/"
            className=' inline-block ml-1 hover:underline'>
            Leancloud <ArrowTopRightOnSquareIcon className='w-4 h-4 inline-block mb-4' />
          </a>
        </p>
      </div>
      <a
        href="https://annatarhe.com"
        target="_blank"
        className='no-underline text-black dark:text-gray-300' rel="noreferrer"
      >
        &copy; AnnatarHe
      </a>
    </footer>
  )
}

export default Footer
