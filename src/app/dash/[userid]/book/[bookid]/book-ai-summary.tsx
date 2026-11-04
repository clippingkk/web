'use client'

import Button from '@annatarhe/lake-ui/button'
import Spinner from '@annatarhe/lake-ui/spinner'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useAIGeneration } from '@/hooks/use-ai-generation'
import { useTranslation } from '@/i18n/client'

type BookAiSummaryProps = {
  bookId: string
  title: string
  author: string
  /** Visitors never see this card. Free readers get the Premium upsell. */
  access: 'free' | 'premium'
  /** A stored summary for these highlights. Showing it does not call the model. */
  initialSummary: string | null
}

function BookAiSummary(props: BookAiSummaryProps) {
  const { bookId, title, author, access, initialSummary } = props
  const { t } = useTranslation(undefined, 'library')
  const cached = initialSummary?.trim() ? initialSummary : null
  const [open, setOpen] = useState(true)
  const [run, setRun] = useState(0)
  const enabled = access === 'premium' && run > 0
  const { text, isLoading, error } = useAIGeneration(
    'book',
    {
      bookId,
      title,
      author,
      // Included so each click changes the request. The route ignores it.
      run,
      // The first request replays a stored summary. Asking again writes a new one.
      force: cached ? run > 0 : run > 1,
    },
    enabled
  )
  const shown = run > 0 ? text : (cached ?? '')
  const heading =
    access === 'premium' ? t('book.ai.title') : t('book.ai.premiumTitle')

  return (
    <details
      className="group rounded-lake-panel border-lake-line bg-lake-surface border p-5"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="text-lake-fg focus-visible:ring-lake-ring cursor-pointer list-none rounded-sm text-sm font-semibold outline-none marker:hidden focus-visible:ring-2">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="text-lake-fg-subtle transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none"
          >
            ›
          </span>
          <Sparkles
            className="text-lake-accent-text size-4"
            aria-hidden="true"
          />
          {heading}
        </span>
      </summary>

      <div className="mt-3 flex flex-col gap-3">
        {access === 'free' ? (
          <>
            <p className="text-lake-fg-muted max-w-3xl text-sm">
              {t('book.ai.premiumDescription')}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-fit"
              render={<Link href="/pricing" />}
            >
              {t('book.ai.upgrade')}
            </Button>
          </>
        ) : shown || run > 0 ? (
          <div aria-live="polite" className="flex flex-col gap-3">
            {error ? (
              <p className="text-lake-danger text-sm">
                {error.message || t('book.ai.error')}
              </p>
            ) : null}
            {shown ? (
              <p className="text-lake-fg max-w-3xl text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
                {shown}
              </p>
            ) : null}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                {shown ? null : (
                  <p className="text-lake-fg-muted text-sm">
                    {t('book.ai.working')}
                  </p>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={() => {
                  setOpen(true)
                  setRun((n) => n + 1)
                }}
              >
                {shown ? t('book.ai.regenerate') : t('book.ai.generate')}
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-lake-fg-muted max-w-3xl text-sm">
              {t('book.ai.description')}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-fit"
              onClick={() => {
                setOpen(true)
                setRun(1)
              }}
            >
              {t('book.ai.generate')}
            </Button>
          </>
        )}
      </div>
    </details>
  )
}

export default BookAiSummary
