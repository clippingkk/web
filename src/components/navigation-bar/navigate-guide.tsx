'use client';
import { ChevronLeftIcon } from '@heroicons/react/24/solid'
import { Button } from '@mantine/core'
import Image from 'next/image'
import Link from 'next/link'
import logo from '../../assets/logo.png'
import React from 'react'
import { useSelector } from 'react-redux'
import { useProfileQuery } from '../../schema/generated'
import { TGlobalStore } from '../../store'
import UserName from '../profile/user-name'
import { getMyHomeLink } from '../../utils/profile'
import { useRouter } from 'next/navigation'
import styles from './navigation-bar.module.css'

type NavigateGuideProps = {
  title?: string
}

function NavigateGuide(props: NavigateGuideProps) {
  const router = useRouter()

  const pid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const { data: p } = useProfileQuery({
    variables: {
      id: pid
    },
    skip: pid < 1,
  })

  return (
    <nav className={styles.navbar + ' bg-gray-800 bg-opacity-30 dark:bg-opacity-80 sticky top-0 py-4 w-full flex items-center z-30 shadow-lg backdrop-filter backdrop-blur-xl with-slide-in'}>
      <div className='container mx-auto flex items-center justify-between py-4'>
        <div className=' text-gray-800 dark:text-white flex items-center'>
          <Button
            variant='light'
            onClick={() => {
              router.back()
            }}
          >
            <ChevronLeftIcon className='w-4 h-4 text-white' />
          </Button>
          <h6 className='ml-4 text-xl font-bold'>{props.title}</h6>
        </div>
        <div>
          {p ? (
            <Link href={getMyHomeLink(p.me)}>
              <UserName
                name={p.me.name}
                premiumEndAt={p.me.premiumEndAt}
              />
            </Link>
          ) : (
            <Link href='/' className='flex items-center'>
              <Image
                src={logo}
                alt="clippingkk logo"
                className='w-10 h-10 mr-2'
                width={40}
                height={40}
              />
              <h6>ClippingKK</h6>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default NavigateGuide
