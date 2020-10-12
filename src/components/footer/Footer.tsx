import React from 'react'

function Footer() {
  return (
    <footer className='flex items-center justify-around md:p-20 p-4 bg-gray-200 dark:bg-gray-700'>
      <a
        href="http://www.miitbeian.gov.cn/"
        target="_blank"
        className='no-underline text-black dark:text-gray-300'
      >
        豫ICP备15003571号
        </a>
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
