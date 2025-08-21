'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect } from 'react'
import logo from '@/assets/logo.png'
import Card from '@/components/card/card'
import GithubLogo from '@/components/icons/github.logo.svg'
import { GithubClientID } from '@/constants/config'
import { useActionTrack, usePageTrack } from '@/hooks/tracke'
import { useTranslation } from '@/i18n/client'
import profile from '@/utils/profile'

type AuthPageProps = {
  children: React.ReactNode
}

function AuthPage(props: AuthPageProps) {
  const children = props.children
  usePageTrack('auth')
  const { push: navigate } = useRouter()
  useEffect(() => {
    const uid = profile.uid
    if (uid && uid > 0) {
      navigate(`/dash/${uid}/home`)
    }
  }, [navigate])

  const { t } = useTranslation()

  const onGithubClick = useActionTrack('login:github')

  return (
    <section className='anna-page-container flex h-screen items-center justify-center'>
      <Card className='with-slide-in'>
        <>
          <div className='mb-4 flex flex-col items-center justify-center'>
            <Image
              src={logo}
              alt='clippingkk logo'
              // className='w-24 h-24 lg:w-48 lg:h-48 shadow-sm rounded-sm'
              width={96}
              height={96}
            />
          </div>
          <div className='flex w-full items-center justify-center rounded-sm'>
            <Link
              href='/auth/phone'
              className={
                'flex bg-indigo-400 px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400'
              }
            >
              {t('app.auth.phone')}
            </Link>

            <Link
              href='/auth/signin'
              className={
                'flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400'
              }
            >
              {t('app.auth.signin')}
            </Link>
          </div>
          <hr className='my-2' />
          {children}
          <hr className='my-2' />
          <div className='flex items-center justify-center'>
            <a
              href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
              onClick={onGithubClick}
              title='github login'
            >
              <GithubLogo />
            </a>
          </div>
        </>
      </Card>
    </section>
  )
}

export default AuthPage
