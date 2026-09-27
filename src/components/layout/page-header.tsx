import { ArrowLeft } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import type React from 'react'

import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: React.ReactNode
  eyebrow?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  meta?: React.ReactNode
  back?: { href: Route; label: string }
  as?: 'h1' | 'h2'
  className?: string
}

function PageHeader(props: PageHeaderProps) {
  const {
    title,
    eyebrow,
    description,
    actions,
    meta,
    back,
    as: Heading = 'h1',
    className,
  } = props
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-lake-line pb-6',
        className
      )}
    >
      {back ? (
        <Link
          href={back.href}
          className="text-lake-fg-subtle hover:text-lake-fg focus-visible:ring-lake-ring inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-150 outline-none focus-visible:ring-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          {eyebrow ? <p className="type-eyebrow">{eyebrow}</p> : null}
          <Heading className="type-title text-lake-fg">{title}</Heading>
          {description ? (
            <p className="type-body text-lake-fg-muted max-w-2xl">
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="type-meta flex flex-wrap items-center gap-x-3 gap-y-1">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default PageHeader
