import React, { useEffect } from 'react'
import Card from '../../components/card/card'
import { navigate, Link } from '@reach/router';
import swal from 'sweetalert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GithubClientID, SignInWithAppleOptions } from '../../constants/config';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { usePageTrack, useActionTrack } from '../../hooks/tracke';
import profile from '../../utils/profile';
import { useTranslation } from 'react-i18next';
import SignInWithApple from '../../components/sign-in-with-apple/sign-in-with-apple';

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
  useEffect(() => {
    showMobileAlert()
    // FIXME: uncomment next lines before commit
    const uid = profile.uid
    if (uid && uid > 0) {
      // navigate(`/dash/${uid}/home`)
    }
  }, [])

  const { t } = useTranslation()

  const onGithubClick = useActionTrack('login:github')

  return (
    <section className='anna-page-container flex h-screen items-center justify-center'>
      <Card>
        <div className='w-full flex items-center justify-center rounded'>
          <Link
            to="/auth/phone"
            getProps={checkIsCurrentPath}
          >{t('app.auth.phone')}</Link>
          <Link
            to="/auth/signup"
            getProps={checkIsCurrentPath}
          >{t('app.auth.signup')}</Link>
          <Link
            to="/auth/signin"
            getProps={checkIsCurrentPath}
          >{t('app.auth.signin')}</Link>
        </div>
        <hr className='my-2' />
        {props.children}
        <hr className='my-2' />
        <div className='flex items-center justify-center'>
          <a
            href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
            onClick={onGithubClick}
          >
            <FontAwesomeIcon icon={faGithub} size="3x" />
          </a>
        </div>
      </Card>
    </section>
  )
}

export default AuthPage
