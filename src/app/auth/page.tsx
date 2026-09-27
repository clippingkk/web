import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import Brand from '@/components/shell/brand'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'

import { AuthCardLoading } from './AuthCard'
import AuthContent, { type AuthPageProps } from './AuthContent'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'auth')
  return pageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/auth',
  })
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { t } = await getTranslation(undefined, 'auth')
  return (
    <main
      id="main"
      className="bg-lake-canvas text-lake-fg flex min-h-dvh flex-col"
    >
      <header className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand href="/" />
        <Link
          href="/"
          className="text-lake-fg-muted hover:text-lake-fg focus-visible:ring-lake-ring rounded-sm text-sm transition-colors duration-150 outline-none focus-visible:ring-2"
        >
          {t('page.back')}
        </Link>
      </header>
      <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col gap-5">
          <p className="type-eyebrow">{t('page.eyebrow')}</p>
          <h1 className="type-display text-lake-fg max-w-lg">
            {t('page.title')}
          </h1>
          <p className="text-lake-fg-muted max-w-md text-lg leading-relaxed">
            {t('page.description')}
          </p>
          <blockquote className="border-marker mt-6 hidden max-w-md border-l-2 pl-5 lg:block">
            <p className="type-quote text-lake-fg-muted italic">
              {t('page.quote')}
            </p>
          </blockquote>
        </div>
        <Suspense fallback={<AuthCardLoading t={t} />}>
          <AuthContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
