'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type BookSummarySectionClientProps = {
  summary: string
  title: string
  showMoreLabel: string
  showLessLabel: string
}

function BookSummarySectionClient({
  summary,
  title,
  showMoreLabel,
  showLessLabel,
}: BookSummarySectionClientProps) {
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const isLongSummary = summary.length > 300

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7 dark:border-white/10 dark:bg-slate-900/65">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-cyan-100/60 via-transparent to-sky-100/60 dark:from-cyan-400/8 dark:to-sky-400/8" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase dark:text-slate-500">
              Overview
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h3>
          </div>

          {isLongSummary && (
            <button
              onClick={() => setSummaryExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-800/75 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
            >
              <span>{summaryExpanded ? showLessLabel : showMoreLabel}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${summaryExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        <div className="relative overflow-hidden">
          <p
            className={`text-[15px] leading-8 whitespace-pre-line text-slate-600 dark:text-slate-300 ${!summaryExpanded && isLongSummary ? 'line-clamp-6' : ''}`}
          >
            {summary}
          </p>

          {!summaryExpanded && isLongSummary && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90" />
          )}
        </div>
      </div>
    </section>
  )
}

export default BookSummarySectionClient
