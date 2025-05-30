'use client'
import logo from '@/assets/logo.png'
import Card from '@/components/card/card'
import GithubLogo from '@/components/icons/github.logo.svg'
import { GithubClientID } from '@/constants/config'
import { useActionTrack, usePageTrack } from '@/hooks/tracke'
import { useTranslation } from '@/i18n/client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type AuthPageProps = {
  children: React.ReactElement
}

function AuthPage(props: AuthPageProps) {
  const children = props.children
  usePageTrack('auth')
  // const { push: navigate } = useRouter()
  // useEffect(() => {
  //   const uid = profile.uid
  //   if (uid && uid > 0) {
  //     navigate(`/dash/${uid}/home`)
  //   }
  // }, [])

  const { t } = useTranslation()

  const onGithubClick = useActionTrack('login:github')

  return (
    <section className="flex h-screen items-center justify-center bg-linear-to-br from-teal-100 to-green-300 dark:from-teal-900 dark:to-slate-900">
      <Card className="with-slide-in container">
        <>
          <div className="mb-4 flex flex-col items-center justify-center">
            <Image
              src={logo}
              alt="clippingkk logo"
              // className='w-24 h-24 lg:w-48 lg:h-48 shadow-sm rounded-sm'
              width={96}
              height={96}
            />
          </div>
          <div className="flex w-full items-center justify-center rounded-sm">
            <Link
              href="/auth/phone"
              className={
                'flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400'
              }
            >
              {t('app.auth.phone')}
            </Link>

            <Link
              href="/auth/signin"
              className={
                'flex bg-indigo-400 px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400'
              }
            >
              {t('app.auth.signin')}
            </Link>
          </div>
          <hr className="my-2" />
          {children}
          <hr className="my-2" />
          <div className="flex items-center justify-center">
            <a
              href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
              onClick={onGithubClick}
              title="github login"
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
