import dayjs from 'dayjs'
import Link from 'next/link'

import { useTranslation } from '@/i18n/client'
import type { Clipping } from '@/schema/generated'
import type { IN_APP_CHANNEL } from '@/services/channel'

import ClippingContent from '../clipping-content'

type BookClippingCardProps = {
  item: Pick<Clipping, 'id' | 'content' | 'pageAt' | 'createdAt'>
  domain: string
  density?: 'default' | 'compact'
  inAppChannel: IN_APP_CHANNEL
  className?: string
}

function BookClippingCard(props: BookClippingCardProps) {
  const {
    item,
    domain,
    density = 'default',
    inAppChannel,
    className = '',
  } = props
  const { t } = useTranslation(undefined, 'book')

  const pageLabel = item.pageAt ? String(item.pageAt).trim() : ''
  const hasPage = pageLabel.length > 0
  const date = item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD') : ''

  const isCompact = density === 'compact'

  return (
    <Link
      href={`/dash/${domain}/clippings/${item.id}?iac=${inAppChannel}`}
      className={`group relative mb-5 block ${className}`}
    >
      <article
        className={[
          'relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ease-out',
          'border-slate-200/60 bg-white/70 shadow-[0_4px_24px_rgba(15,23,42,0.04)]',
          'hover:-translate-y-0.5 hover:border-blue-300/60 hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]',
          'dark:border-slate-700/50 dark:bg-slate-800/60 dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)]',
          'dark:hover:border-blue-400/40 dark:hover:shadow-[0_12px_40px_rgba(59,130,246,0.2)]',
          'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          isCompact ? 'p-4 lg:p-5' : 'p-6 lg:p-7',
        ].join(' ')}
      >
        {/* Subtle left quote accent bar */}
        {!isCompact && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400/70 via-blue-400/40 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/80 dark:via-blue-400/40"
          />
        )}

        {/* Top row: page pill + date */}
        {(hasPage || date) && (
          <header
            className={`flex items-center justify-between gap-2 ${isCompact ? 'mb-2' : 'mb-3'}`}
          >
            {hasPage ? (
              <span className="inline-flex items-center rounded-full border border-blue-200/60 bg-blue-50/70 px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide text-blue-600 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300">
                {t('app.book.clippings.meta.page', { page: pageLabel })}
              </span>
            ) : (
              <span />
            )}
            {date && (
              <time
                dateTime={item.createdAt as unknown as string}
                className="text-[11px] font-medium tracking-wide text-slate-400 tabular-nums dark:text-slate-500"
              >
                {date}
              </time>
            )}
          </header>
        )}

        {/* Body */}
        <ClippingContent
          content={item.content}
          maxLines={isCompact ? 4 : 0}
          className={[
            'font-lxgw text-slate-800 dark:text-slate-200',
            isCompact
              ? 'text-base leading-relaxed lg:text-lg'
              : 'text-lg leading-relaxed lg:text-xl',
          ].join(' ')}
        />
      </article>
    </Link>
  )
}

export default BookClippingCard
