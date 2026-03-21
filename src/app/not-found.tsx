import { ArrowLeft, BookX } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { getTranslation } from '@/i18n'

export const metadata: Metadata = {
  title: 'Page Not Found - ClippingKK',
  description: 'The page you are looking for does not exist.',
}

async function NotFound() {
  const { t } = await getTranslation()

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 backdrop-blur-xl md:p-12 dark:border-gray-800/30">
        {/* Decorative blur elements */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-purple-500/30 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-indigo-500/10 p-6 dark:bg-indigo-500/20">
            <BookX size={64} className="text-indigo-500" strokeWidth={2} />
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            404
          </h1>

          <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
            {t('page_not_found')}
          </h2>

          <p className="mb-8 text-gray-600 dark:text-gray-300">
            {t('page_not_found_message')}
          </p>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30"
          >
            <ArrowLeft size={20} />
            {t('return_home')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
