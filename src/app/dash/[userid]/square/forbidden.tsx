import { Lock, LogIn } from 'lucide-react'
import Link from 'next/link'

import Surface from '@/components/ui/surface/surface'
import { getTranslation } from '@/i18n'

async function SquareForbidden() {
  const { t } = await getTranslation()

  return (
    <div className="flex w-full items-center justify-center py-10">
      <Surface
        variant="elevated"
        className="with-slide-in w-full max-w-lg p-8 text-center"
      >
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/20 dark:bg-amber-400/15">
          <Lock className="h-7 w-7 text-amber-500 dark:text-amber-300" />
        </div>

        <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          {t('app.square.forbidden.title')}
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {t('app.square.forbidden.description')}
        </p>

        <Link
          href="/auth/auth-v4"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
        >
          <LogIn className="h-4 w-4" />
          {t('app.square.forbidden.signIn')}
        </Link>
      </Surface>
    </div>
  )
}

export default SquareForbidden
