'use client'

import Avatar from '@annatarhe/lake-ui/avatar'
import Badge from '@annatarhe/lake-ui/badge'
import { Lock } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'

import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/format-date'
import { resolveMediaUrl } from '@/utils/image'

import { splitClippingLines } from './clipping-text'

export type ClippingCardData = {
  id: number
  content: string
  title?: string | null
  pageAt?: string | null
  createdAt?: string | null
  visible?: boolean | null
}

export type ClippingCardCreator = {
  name: string
  avatar?: string | null
}

export type ClippingCardVariant = 'grid' | 'list' | 'compact' | 'feature'

type ClippingCardProps = {
  clipping: ClippingCardData
  href: Route
  /** Wenqu title when known; falls back to the raw Kindle title. */
  bookTitle?: string | null
  creator?: ClippingCardCreator | null
  variant?: ClippingCardVariant
  /** Owner view: mark clippings that only the owner can see. */
  showPrivate?: boolean
  className?: string
}

const clampByVariant: Record<ClippingCardVariant, string> = {
  grid: 'line-clamp-[12]',
  list: 'line-clamp-[8]',
  compact: 'line-clamp-4',
  feature: 'line-clamp-[9]',
}

function ClippingCard(props: ClippingCardProps) {
  const {
    clipping,
    href,
    bookTitle,
    creator,
    variant = 'grid',
    showPrivate = false,
    className,
  } = props
  const { t, i18n } = useTranslation(undefined, 'common')

  const lines = splitClippingLines(clipping.content)
  if (lines.length === 0) return null

  const title = bookTitle || clipping.title || ''
  const isPrivate = showPrivate && clipping.visible === false
  const date = formatDate(clipping.createdAt, i18n.language)
  const meta = [
    clipping.pageAt ? t('clipping.page', { page: clipping.pageAt }) : null,
    date || null,
  ].filter(Boolean)

  const quote = (
    <p
      className={cn(
        'whitespace-pre-line text-lake-fg',
        variant === 'feature' ? 'type-quote-lg' : 'type-quote',
        clampByVariant[variant]
      )}
    >
      {lines.join('\n')}
    </p>
  )

  const privateBadge = isPrivate ? (
    <Badge
      tone="neutral"
      variant="outline"
      size="sm"
      icon={<Lock className="size-3" aria-hidden="true" />}
    >
      {t('clipping.private')}
    </Badge>
  ) : null

  const creatorChip = creator ? (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar
        src={creator.avatar ? resolveMediaUrl(creator.avatar) : null}
        name={creator.name}
        size="xs"
      />
      <span className="text-lake-fg-muted truncate">{creator.name}</span>
    </span>
  ) : null

  const focusRing =
    'outline-none focus-visible:ring-2 focus-visible:ring-lake-ring focus-visible:ring-offset-2 focus-visible:ring-offset-lake-canvas'

  if (variant === 'feature') {
    return (
      <Link
        href={href}
        className={cn(
          'group block rounded-lake-panel transition-colors duration-150',
          focusRing,
          className
        )}
      >
        <figure className="flex flex-col gap-4">
          <span
            aria-hidden="true"
            className="font-reading text-lake-accent/50 h-8 text-6xl leading-none select-none"
          >
            “
          </span>
          <blockquote className="group-hover:text-lake-fg-muted transition-colors duration-150">
            {quote}
          </blockquote>
          <figcaption className="type-meta flex flex-wrap items-center gap-x-2 gap-y-1">
            {title ? (
              <span className="font-reading text-lake-fg-muted italic">
                {title}
              </span>
            ) : null}
            {creator ? (
              <>
                <span aria-hidden="true">·</span>
                {creatorChip}
              </>
            ) : null}
            {privateBadge}
          </figcaption>
        </figure>
      </Link>
    )
  }

  if (variant === 'list') {
    return (
      <Link
        href={href}
        className={cn(
          'group border-lake-line hover:bg-lake-surface/60 -mx-3 grid gap-3 rounded-lake-control border-b px-3 py-6 transition-colors duration-150 last:border-b-0',
          focusRing,
          className
        )}
      >
        <blockquote className="before:bg-marker relative pl-4 before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-0.5 before:rounded-full">
          {quote}
        </blockquote>
        <div className="type-meta flex flex-wrap items-center gap-x-3 gap-y-1 pl-4">
          {creatorChip}
          {title && creator ? (
            <span className="truncate italic">{title}</span>
          ) : null}
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
          {privateBadge}
        </div>
      </Link>
    )
  }

  const isCompact = variant === 'compact'
  return (
    <Link
      href={href}
      className={cn(
        'group rounded-lake-panel border-lake-line bg-lake-surface shadow-lake-card hover:border-lake-line-strong flex flex-col border transition-colors duration-150',
        isCompact ? 'gap-3 p-4' : 'gap-4 p-5',
        focusRing,
        className
      )}
    >
      {title ? <p className="type-eyebrow truncate">{title}</p> : null}
      <blockquote>{quote}</blockquote>
      <footer className="type-meta mt-auto flex items-center justify-between gap-3">
        {creatorChip ?? <span className="truncate">{meta.join(' · ')}</span>}
        {privateBadge}
      </footer>
    </Link>
  )
}

export default ClippingCard
