import { Bookmark, CalendarRange, Clock } from 'lucide-react'

import dayjs from '@/utils/dayjs'

type Props = {
  clippingsCount?: number
  duration?: number
  startReadingAt?: string
  lastReadingAt?: string
  highlightsLabel: string
  readingDaysLabel: string
  readingPeriodLabel: string
}

function BookStatsBar({
  clippingsCount,
  duration,
  startReadingAt,
  lastReadingAt,
  highlightsLabel,
  readingDaysLabel,
  readingPeriodLabel,
}: Props) {
  const hasDateRange = startReadingAt && lastReadingAt

  return (
    <div className="flex flex-wrap gap-3">
      {clippingsCount != null && clippingsCount > 0 && (
        <div className="flex min-w-[180px] items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/78 px-4 py-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
          <div className="rounded-2xl bg-cyan-50 p-3 dark:bg-cyan-500/12">
            <Bookmark className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {clippingsCount}
            </p>
            <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500">
              {highlightsLabel}
            </p>
          </div>
        </div>
      )}

      {duration != null && duration > 0 && (
        <div className="flex min-w-[180px] items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/78 px-4 py-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
          <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/12">
            <Clock className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {duration}
            </p>
            <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500">
              {readingDaysLabel}
            </p>
          </div>
        </div>
      )}

      {hasDateRange && (
        <div className="flex min-w-[240px] items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/78 px-4 py-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
          <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-500/12">
            <CalendarRange className="h-4 w-4 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {dayjs(startReadingAt).format('YYYY/MM/DD')} –{' '}
              {dayjs(lastReadingAt).format('YYYY/MM/DD')}
            </p>
            <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500">
              {readingPeriodLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookStatsBar
