import { ChevronLeftIcon } from '@heroicons/react/24/solid'
import { Button } from '@mantine/core'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import styles from './navigation-bar.module.css'

type NavigateGuideProps = {
  title?: string
}

function NavigateGuide(props: NavigateGuideProps) {
  const router = useRouter()
  return (
    <nav className={styles.navbar + ' bg-gray-800 bg-opacity-50 dark:bg-opacity-80 sticky top-0 py-4 w-full flex items-center z-30 shadow-lg backdrop-filter backdrop-blur-xl with-slide-in'}>
      <div className=' dark:text-white flex items-center py-4 container mx-auto'>
        <Button
          variant='light'
          onClick={() => {
            router.back()
          }}
        >
          <ChevronLeftIcon className='w-4 h-4' />
        </Button>
        <h6 className='ml-4 text-xl font-bold'>{props.title}</h6>
      </div>
    </nav>
  )
}

export default NavigateGuide
