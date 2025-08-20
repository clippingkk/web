import { BookOpenText } from 'lucide-react'
import { useTranslation } from '@/i18n'
import type { WenquBook } from '../../services/wenqu'
import PublicBookItem from '../public-book-item/public-book-item'

type TopBooksProps = {
  books: WenquBook[]
}

async function TopBooks(props: TopBooksProps) {
  const { t } = await useTranslation()
  return (
    <div className="relative overflow-hidden px-4 py-20 sm:px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-40 left-1/2 h-60 w-full max-w-6xl -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/5 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center">
          {/* Section Title with gradient */}
          <div className="mb-4 flex items-center gap-3">
            <BookOpenText size={32} className="text-blue-500" />
            <h2 className="font-lato bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl">
              {t('app.public.readings')}
            </h2>
          </div>

          {/* Section description with subtle style */}
          <p className="mb-2 max-w-2xl text-center text-slate-600 dark:text-slate-300">
            {t('app.explore.books.desc') ||
              'Discover popular books from our community'}
          </p>

          {/* Decorative line */}
          <div className="mt-2 mb-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
        </div>

        {/* Books showcase with improved layout */}
        <div className="relative">
          {/* Books grid with horizontal scroll on mobile */}
          <div className="relative flex gap-8 overflow-x-auto py-4 pb-8 md:flex-wrap md:items-center md:justify-center md:overflow-visible md:pb-4">
            {props.books.length === 0 ? (
              <div className="w-full py-12 text-center text-slate-500 dark:text-slate-400">
                <p>{t('app.no.books') || 'No books found'}</p>
              </div>
            ) : (
              props.books.map((b) => (
                <div
                  key={b.id}
                  className="transform transition-transform duration-500 hover:scale-105"
                >
                  <PublicBookItem book={b} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBooks
