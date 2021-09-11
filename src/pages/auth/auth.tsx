import React, { useEffect } from 'react'
import Card from '../../components/card/card'
import Link from 'next/link'
import Image from 'next/image'
import swal from 'sweetalert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GithubClientID, SignInWithAppleOptions } from '../../constants/config';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { usePageTrack, useActionTrack } from '../../hooks/tracke';
import profile from '../../utils/profile';
import { useTranslation } from 'react-i18next';
import SignInWithApple from '../../components/sign-in-with-apple/sign-in-with-apple';
import { useRouter } from 'next/router';

function checkIsCurrentPath({ isCurrent }: any) {
  return {
    className: `flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400 ${isCurrent ? 'bg-indigo-400' : ''}`
  }
}

type AuthPageProps = {
  children: React.ReactElement
}

function showMobileAlert() {
  if (screen.width > 720) {
    return Promise.resolve(null)
  }
  return swal({
    title: '敬告',
    text: '手机体验很差哦，建议切换到电脑访问： https://kindle.annatarhe.com',
    icon: 'info'
  })
}

function AuthPage(props: AuthPageProps) {
  usePageTrack('auth')
  const { push: navigate, pathname } = useRouter()
  useEffect(() => {
    showMobileAlert()
    const uid = profile.uid
    if (uid && uid > 0) {
      navigate(`/dash/${uid}/home`)
    }
  }, [])

  const { t } = useTranslation()

  const onGithubClick = useActionTrack('login:github')

  return (
    <section className='anna-page-container flex h-screen items-center justify-center'>
      <Card className='with-slide-in'>
        <div className='flex items-center justify-center flex-col mb-4'>
          <Image
            src={require('../../assets/logo.png').default}
            alt="clippingkk logo"
            // className='w-24 h-24 lg:w-48 lg:h-48 shadow rounded'
            width={96}
            height={96}
          />

        </div>
        <div className='w-full flex items-center justify-center rounded'>
          <Link
            href="/auth/phone"
          >
            <a
              className={`flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400 ${pathname.endsWith('phone') ? 'bg-indigo-400' : ''}`}
            >
              {t('app.auth.phone')}
            </a>
          </Link>

          <Link
            href="/auth/signin"
          // getProps={checkIsCurrentPath}
          >
            <a className={`flex px-8 py-4 text-lg transition-colors duration-200 hover:bg-indigo-400 ${pathname.endsWith('signin') ? 'bg-indigo-400' : ''}`}>
              {t('app.auth.signin')}
            </a>
          </Link>
        </div>
        <hr className='my-2' />
        {props.children}
        <hr className='my-2' />
        <div className='flex items-center justify-center'>
          <a
            href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
            onClick={onGithubClick}
            title='github login'
          >
            <FontAwesomeIcon icon={faGithub} size="3x" />
          </a>
        </div>
      </Card>
    </section>
  )
}

export default AuthPage
