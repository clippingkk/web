import { ArrowLeft, BookX } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import Surface from '@/components/ui/surface/surface'
import { getTranslation } from '@/i18n'

export const metadata: Metadata = {
  title: 'Page Not Found - ClippingKK',
  description: 'The page you are looking for does not exist.',
}

async function NotFound() {
  const { t } = await getTranslation()

  return (
    <div className="anna-page-container relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 md:p-8">
      <DecorBlobs />
      <Surface
        variant="elevated"
        className="with-slide-in relative z-10 w-full max-w-xl p-8 md:p-12"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-400/10 ring-1 ring-blue-400/20 dark:bg-blue-400/15">
            <BookX
              size={48}
              className="text-blue-500 dark:text-blue-300"
              strokeWidth={2}
            />
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            404
          </h1>

          <h2 className="mb-3 text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">
            {t('page_not_found')}
          </h2>

          <p className="mb-8 text-slate-600 dark:text-slate-300">
            {t('page_not_found_message')}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-400 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
          >
            <ArrowLeft size={18} />
            {t('return_home')}
          </Link>
        </div>
      </Surface>
    </div>
  )
}

export default NotFound
