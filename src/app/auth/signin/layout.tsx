'use client'
import React, { useEffect, use } from 'react';
import Card from '../../../components/card/card'
import Link from 'next/link'
import Image from 'next/image'
import { GithubClientID, SignInWithAppleOptions } from '../../../constants/config';
import { usePageTrack, useActionTrack } from '../../../hooks/tracke';
import { useTranslation } from 'react-i18next';
import logo from '../../../assets/logo.png'
import GithubLogo from '../../../components/icons/github.logo.svg';

function checkIsCurrentPath({ isCurrent }: any) {
  return {
    className: `flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400 ${isCurrent ? 'bg-indigo-400' : ''}`
  }
}

type AuthPageProps = {
  children: React.ReactElement
}

function AuthPage(props: AuthPageProps) {
  const children = use(props.children);
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
    (<section className=' from-teal-100 to-green-300 bg-gradient-to-br dark:from-teal-900 dark:to-slate-900 flex h-screen items-center justify-center'>
      <Card className='with-slide-in container'>
        <>
          <div className='flex items-center justify-center flex-col mb-4'>
            <Image
              src={logo}
              alt="clippingkk logo"
              // className='w-24 h-24 lg:w-48 lg:h-48 shadow rounded'
              width={96}
              height={96}
            />

          </div>
          <div className='w-full flex items-center justify-center rounded'>
            <Link
              href="/auth/phone"
              className={`flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400`}>
              {t('app.auth.phone')}
            </Link>

            <Link
              href="/auth/signin"
              className={`flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400 bg-indigo-400`}>

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
    </section>)
  );
}

export default AuthPage
