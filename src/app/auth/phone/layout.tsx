'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect } from 'react'

import logoDark from '@/assets/logo-dark.svg'
import logoLight from '@/assets/logo-light.svg'
import GithubLogo from '@/components/icons/github.logo.svg'
import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import Surface from '@/components/ui/surface/surface'
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
    <section className="anna-page-container relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <DecorBlobs />
      <Surface
        variant="elevated"
        className="with-slide-in relative z-10 w-full max-w-md p-8 md:p-10"
      >
        <div className="mb-6 flex flex-col items-center justify-center">
          <Image
            src={logoLight}
            alt="clippingkk logo"
            className="dark:hidden"
            width={80}
            height={80}
          />
          <Image
            src={logoDark}
            alt="clippingkk logo"
            className="hidden dark:block"
            width={80}
            height={80}
          />
          <h1 className="font-lato mt-3 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
            ClippingKK
          </h1>
        </div>

        <nav
          className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-slate-200/70 bg-slate-50/80 p-1 dark:border-slate-800/60 dark:bg-slate-900/60"
          aria-label="Auth methods"
        >
          <Link
            href="/auth/phone"
            aria-current="page"
            className="rounded-lg bg-blue-400 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500 dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
          >
            {t('app.auth.phone')}
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-lg px-4 py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {t('app.auth.signin')}
          </Link>
        </nav>

        <div className="space-y-4">{children}</div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200/70 dark:border-slate-800/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white/70 px-3 text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/70 dark:text-slate-400">
              {t('app.auth.or') || 'or'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <a
            href={`https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`}
            onClick={onGithubClick}
            title="github login"
            className="rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <GithubLogo />
          </a>
        </div>
      </Surface>
    </section>
  )
}

export default AuthPage
