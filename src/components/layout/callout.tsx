import { X } from 'lucide-react'
import type React from 'react'

import { cn } from '@/lib/utils'

type CalloutProps = {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  tone?: 'neutral' | 'accent' | 'warning'
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}

const toneClass = {
  neutral: 'border-lake-line bg-lake-surface',
  accent: 'border-lake-accent/30 bg-lake-accent-soft',
  warning: 'border-lake-warning/30 bg-lake-warning-soft',
} as const

const iconToneClass = {
  neutral: 'text-lake-fg-muted',
  accent: 'text-lake-accent-text',
  warning: 'text-lake-warning',
} as const

/** An inline notice with an optional action, e.g. "12 highlights need a book". */
function Callout(props: CalloutProps) {
  const {
    icon,
    title,
    description,
    action,
    tone = 'neutral',
    onDismiss,
    dismissLabel,
    className,
  } = props
  return (
    <div
      className={cn(
        'rounded-lake-panel flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:gap-4',
        toneClass[tone],
        className
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn('shrink-0 [&_svg]:size-5', iconToneClass[tone])}
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-lake-fg text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-lake-fg-muted mt-0.5 text-sm">{description}</p>
        ) : null}
      </div>
      {action || onDismiss ? (
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={dismissLabel}
              className="text-lake-fg-subtle hover:bg-lake-surface-muted hover:text-lake-fg rounded-lake-control focus-visible:ring-lake-ring p-1.5 transition-colors duration-150 outline-none focus-visible:ring-2"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Callout
