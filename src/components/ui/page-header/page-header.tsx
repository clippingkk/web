import type React from 'react'

import { cn } from '@/lib/utils'

type PageHeaderAlign = 'start' | 'center'

type PageHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
  align?: PageHeaderAlign
  className?: string
  titleClassName?: string
  as?: 'h1' | 'h2'
}

/**
 * PageHeader — unified page/section title.
 *
 * All pages share the same gradient heading (blue-400 → indigo-500) per
 * CLAUDE.md. Supports optional eyebrow label, leading icon, description,
 * and a trailing action slot (e.g. primary CTA).
 */
function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
  align = 'start',
  className,
  titleClassName,
  as = 'h1',
}: PageHeaderProps) {
  const Title = as
  const isCentered = align === 'center'
  return (
    <header
      className={cn(
        'mb-8 flex flex-col gap-4 md:mb-10',
        isCentered
          ? 'items-center text-center'
          : 'md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className={cn('flex flex-col gap-2', isCentered && 'items-center')}>
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-blue-500/90 uppercase dark:text-blue-300/90">
            {eyebrow}
          </span>
        ) : null}
        <div
          className={cn(
            'flex items-center gap-3',
            isCentered && 'justify-center'
          )}
        >
          {icon ? (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-500 ring-1 ring-blue-400/20 dark:bg-blue-400/15 dark:text-blue-300">
              {icon}
            </span>
          ) : null}
          <Title
            className={cn(
              'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl',
              titleClassName
            )}
          >
            {title}
          </Title>
        </div>
        {description ? (
          <p className="max-w-2xl text-sm text-slate-600 md:text-base dark:text-slate-300">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          className={cn(
            'flex flex-wrap items-center gap-2',
            isCentered ? 'justify-center' : 'md:justify-end'
          )}
        >
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export default PageHeader
