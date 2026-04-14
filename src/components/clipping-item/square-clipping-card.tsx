import { BookOpen } from 'lucide-react'
import Link from 'next/link'

import { useTranslation } from '@/i18n/client'
import type { Clipping, User } from '@/schema/generated'
import type { IN_APP_CHANNEL } from '@/services/channel'
import type { WenquBook } from '@/services/wenqu'

import Avatar from '../avatar/avatar'
import ClippingContent from '../clipping-content'

type SquareClippingCardProps = {
  item: Pick<Clipping, 'id' | 'content' | 'bookID' | 'title'>
  book?: WenquBook
  creator: Pick<User, 'id' | 'avatar' | 'name' | 'clippingsCount' | 'domain'>
  domain: string
  density?: 'default' | 'compact'
  inAppChannel: IN_APP_CHANNEL
  className?: string
}

function SquareClippingCard(props: SquareClippingCardProps) {
  const {
    item,
    book,
    creator,
    domain,
    density = 'default',
    inAppChannel,
    className = '',
  } = props
  const { t } = useTranslation()

  const isCompact = density === 'compact'
  const title = book?.title ?? item.title

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
        {/* Left quote accent bar */}
        {!isCompact && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400/70 via-blue-400/40 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/80 dark:via-blue-400/40"
          />
        )}

        {/* Book title head */}
        {title && (
          <header
            className={`flex min-w-0 items-center gap-2 ${isCompact ? 'mb-2' : 'mb-3'}`}
          >
            <BookOpen
              size={13}
              className="shrink-0 text-slate-400 dark:text-slate-500"
              aria-hidden
            />
            <span className="truncate text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {title}
            </span>
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

        {/* Creator footer */}
        <footer
          className={`flex items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-700/50 ${isCompact ? 'mt-4 pt-3' : 'mt-6 pt-4'}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              img={creator.avatar}
              name={creator.name}
              className="h-9 w-9 shrink-0 ring-1 ring-slate-200/70 dark:ring-slate-700/60"
            />
            <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
              {creator.name}
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50/70 px-2 py-0.5 text-[11px] font-medium tracking-wide text-blue-600 tabular-nums dark:bg-blue-400/10 dark:text-blue-300">
            {t('app.profile.records', { count: creator.clippingsCount })}
          </span>
        </footer>
      </article>
    </Link>
  )
}

export default SquareClippingCard
