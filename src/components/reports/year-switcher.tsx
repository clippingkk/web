import type { Route } from 'next'
import Link from 'next/link'

import { cn } from '@/lib/utils'

type YearSwitcherProps = {
  uid: number
  years: number[]
  current: number
  label: string
}

export function yearlyReportHref(uid: number, year: number) {
  return `/report/yearly?uid=${uid}&year=${year}` as Route
}

/** Links to every year of the reader's account, newest first. */
function YearSwitcher({ uid, years, current, label }: YearSwitcherProps) {
  if (years.length < 2) return null
  return (
    <nav aria-label={label} className="no-scrollbar -mx-1 overflow-x-auto">
      <ul className="flex w-max items-center gap-1 px-1 py-1">
        {years.map((year) => {
          const active = year === current
          return (
            <li key={year}>
              <Link
                href={yearlyReportHref(uid, year)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-lake-control focus-visible:ring-lake-ring block px-3 py-1.5 text-sm tabular-nums transition-colors duration-150 outline-none focus-visible:ring-2',
                  active
                    ? 'bg-lake-fg text-lake-canvas font-medium'
                    : 'text-lake-fg-muted hover:bg-lake-surface-muted hover:text-lake-fg'
                )}
              >
                {year}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default YearSwitcher
