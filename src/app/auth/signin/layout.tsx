import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'

import logoDark from '@/assets/logo-dark.svg'
import logoLight from '@/assets/logo-light.svg'
import Card from '@/components/card/card'
import PageTrack from '@/components/track/page-track'
import { getTranslation } from '@/i18n'

import TrackedGithubLink from './tracked-github-link'

type AuthPageProps = {
  children: React.ReactNode
}

async function AuthPage(props: AuthPageProps) {
  const { children } = props
  const { t } = await getTranslation()

  return (
    <section className="flex h-screen items-center justify-center bg-linear-to-br from-teal-100 to-green-300 dark:from-teal-900 dark:to-slate-900">
      <PageTrack page="auth" />
      <Card className="with-slide-in container">
        <>
          <div className="mb-4 flex flex-col items-center justify-center">
            <Image
              src={logoLight}
              alt="clippingkk logo"
              className="dark:hidden"
              width={96}
              height={96}
            />
            <Image
              src={logoDark}
              alt="clippingkk logo"
              className="hidden dark:block"
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
            <TrackedGithubLink />
          </div>
        </>
      </Card>
    </section>
  )
}

export default AuthPage
