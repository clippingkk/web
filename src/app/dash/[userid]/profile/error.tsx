'use client'

import { AlertTriangle, Home, RotateCw } from 'lucide-react'
import Link from 'next/link'

import Surface from '@/components/ui/surface/surface'
import { useTranslation } from '@/i18n/client'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full items-center justify-center py-10">
      <Surface
        variant="elevated"
        className="with-slide-in w-full max-w-lg p-8 text-center"
      >
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/10 ring-1 ring-rose-400/20 dark:bg-rose-400/15">
          <AlertTriangle className="h-7 w-7 text-rose-500 dark:text-rose-300" />
        </div>

        <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          {t('app.profile.error.title')}
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {t('app.profile.error.description')}
        </p>

        {(error.message || error.digest) && (
          <div className="mb-6 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-left text-xs">
            {error.message && (
              <p className="text-rose-600 dark:text-rose-300">
                {error.message}
              </p>
            )}
            {error.digest && (
              <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
          >
            <RotateCw className="h-4 w-4" />
            {t('app.profile.error.tryAgain')}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-300"
          >
            <Home className="h-4 w-4" />
            {t('app.profile.error.goHome')}
          </Link>
        </div>
      </Surface>
    </div>
  )
}
