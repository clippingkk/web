import type React from 'react'

import { cn } from '@/lib/utils'

type SettingsSectionProps = {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/** One titled block of a settings page; the page title comes from the nav. */
export function SettingsSection(props: SettingsSectionProps) {
  const { title, description, actions, children, className } = props
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex max-w-2xl flex-col gap-1">
          <h2 className="type-heading text-lake-fg">{title}</h2>
          {description ? (
            <p className="text-lake-fg-muted text-sm">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

type SettingsRowProps = {
  label: React.ReactNode
  description?: React.ReactNode
  control: React.ReactNode
  htmlFor?: string
}

/** A label on the left, its control on the right (stacked on mobile). */
export function SettingsRow({
  label,
  description,
  control,
  htmlFor,
}: SettingsRowProps) {
  const Label = htmlFor ? 'label' : 'p'
  return (
    <div className="border-lake-line flex flex-col gap-3 border-b py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="flex flex-col gap-0.5">
        <Label
          {...(htmlFor ? { htmlFor } : {})}
          className="text-lake-fg text-sm font-medium"
        >
          {label}
        </Label>
        {description ? (
          <p className="text-lake-fg-muted text-sm">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

export function SettingsCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lake-panel border-lake-line bg-lake-surface border px-5 sm:px-6',
        className
      )}
    >
      {children}
    </div>
  )
}
