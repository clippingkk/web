import React from 'react'

function ICPInfo() {
  return (
    <a
      href="http://www.miitbeian.gov.cn/"
      target="_blank"
      className='no-underline text-black dark:text-gray-300'
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
          <small className='ml-2 hidden'>
          and 
          <a href="https://i.fanyijing.love" className='ml-2'>jing</a>
          </small>
        </p>
        <p>Version: {__VERSION__}</p>
      </div>
      <a
        href="https://annatarhe.com"
        target="_blank"
        className='no-underline text-black dark:text-gray-300'
      >
        &copy; AnnatarHe
        </a>
    </footer>
  )
}

export default Footer
