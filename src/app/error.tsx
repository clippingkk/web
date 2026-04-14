'use client'

import { AlertTriangle, Home, RotateCw } from 'lucide-react'
import Link from 'next/link'

import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import Surface from '@/components/ui/surface/surface'
import { useTranslation } from '@/i18n/client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation(undefined, 'error')

  return (
    <div className="anna-page-container relative min-h-screen w-full overflow-hidden">
      <DecorBlobs tone="danger" />
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
        <Surface
          variant="elevated"
          className="with-slide-in w-full max-w-md p-8"
        >
          <h2 className="font-lato mb-6 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-center text-3xl font-bold tracking-tight text-transparent">
            ClippingKK
          </h2>

          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-400/10 ring-1 ring-rose-400/20 dark:bg-rose-400/15">
            <AlertTriangle className="h-8 w-8 text-rose-500 dark:text-rose-300" />
          </div>

          <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900 dark:text-white">
            {t('error.title') || 'Something went wrong!'}
          </h1>

          <div className="mt-4 mb-8 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-center text-sm">
            <p className="text-rose-600 dark:text-rose-300">
              {error.message || t('error.generic')}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
            >
              <RotateCw className="h-4 w-4" />
              {t('error.tryAgain') || 'Try again'}
            </button>

            <Link
              href="/"
              className="mt-1 inline-flex items-center justify-center gap-2 text-sm text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-300"
            >
              <Home className="h-4 w-4" />
              {t('error.goHome') || 'Return to home page'}
            </Link>
          </div>
        </Surface>
      </div>
    </div>
  )
}
