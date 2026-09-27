'use client'

import { useId, useState } from 'react'

import { cn } from '@/lib/utils'

type BookSummaryProps = {
  summary: string
  title: string
  showMoreLabel: string
  showLessLabel: string
}

function BookSummary(props: BookSummaryProps) {
  const { summary, title, showMoreLabel, showLessLabel } = props
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const paragraphs = summary
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
  const isLong = summary.length > 280

  return (
    <div className="flex flex-col gap-2">
      <h2 className="type-eyebrow">{title}</h2>
      <div
        id={id}
        className={cn(
          'text-lake-fg-muted flex flex-col gap-2 text-[0.9375rem] leading-relaxed',
          isLong && !expanded && 'line-clamp-4'
        )}
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {isLong ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((v) => !v)}
          className="text-lake-accent-text focus-visible:ring-lake-ring w-fit rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-2"
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </div>
  )
}

export default BookSummary
