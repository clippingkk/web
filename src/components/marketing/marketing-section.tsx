import type React from 'react'

import { cn } from '@/lib/utils'

type MarketingSectionProps = {
  id: string
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** A landing-page section: eyebrow, serif heading and a hairline rule. */
function MarketingSection(props: MarketingSectionProps) {
  const { id, eyebrow, title, description, action, className, children } = props
  const headingId = `${id}-title`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('flex flex-col gap-8', className)}
    >
      <header className="border-lake-line flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="flex max-w-2xl min-w-0 flex-col gap-2">
          {eyebrow ? <p className="type-eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId} className="type-title text-lake-fg">
            {title}
          </h2>
          {description ? (
            <p className="type-body text-lake-fg-muted">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  )
}

export default MarketingSection
