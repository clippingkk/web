import type React from 'react'

import { cn } from '@/lib/utils'

type SectionProps = {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  variant?: 'plain' | 'card'
  headingLevel?: 2 | 3
  className?: string
  children: React.ReactNode
}

function Section(props: SectionProps) {
  const {
    id,
    title,
    description,
    actions,
    variant = 'plain',
    headingLevel = 2,
    className,
    children,
  } = props
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const headingId = id && title ? `${id}-title` : undefined
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-4',
        variant === 'card' &&
          'rounded-lake-panel border border-lake-line bg-lake-surface p-5 shadow-lake-card sm:p-6',
        className
      )}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {title ? (
              <Heading id={headingId} className="type-heading text-lake-fg">
                {title}
              </Heading>
            ) : null}
            {description ? (
              <p className="text-lake-fg-muted text-sm">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export default Section
