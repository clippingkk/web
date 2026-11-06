'use client'

import Button from '@annatarhe/lake-ui/button'
import Skeleton from '@annatarhe/lake-ui/skeleton'
import { ChevronDown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import AIErrorNotice from '@/components/ai/ai-error-notice'
import AIPremiumPrompt from '@/components/ai/ai-premium-prompt'
import AIResultActions from '@/components/ai/ai-result-actions'
import { useAIObject, type AIResult } from '@/hooks/use-ai-object'
import { useTranslation } from '@/i18n/client'
import { bookSummaryToMarkdown } from '@/lib/ai/format'
import {
  bookSummarySchema,
  type BookSummary,
  type BookSummaryContext,
} from '@/lib/ai/schemas'
import { cn } from '@/lib/utils'
import { clippingHref, type SlugSource } from '@/utils/profile.utils'

type BookAiSummaryProps = {
  bookId: string
  title: string
  /** Whose highlights these are, for links back to them. */
  owner: SlugSource
  /** Visitors never see this card. Free readers get the Premium upsell. */
  access: 'free' | 'premium'
  /** A stored summary for these highlights. Showing it does not call the model. */
  initial: AIResult<BookSummary, BookSummaryContext> | null
}

/** One or two themes read better wide. Four would be cramped in one row. */
function themeColumns(count: number) {
  if (count === 1) return 'grid-cols-1'
  if (count === 3) return 'md:grid-cols-3'
  return 'md:grid-cols-2'
}

function PremiumSummary(props: Omit<BookAiSummaryProps, 'access'>) {
  const { bookId, title, owner, initial } = props
  const { t } = useTranslation(undefined, 'ai')
  const ai = useAIObject<typeof bookSummarySchema, BookSummaryContext>({
    kind: 'book',
    schema: bookSummarySchema,
    threadId: `book-summary:${bookId}`,
    initial,
  })
  const { result, draft, context, isLoading, error, stop } = ai
  const generate = (force: boolean) => ai.generate({ bookId, force })
  const summary = draft ?? result?.object ?? null

  if (!summary && !isLoading) {
    return (
      <div className="flex flex-col items-start gap-3">
        {error ? (
          <AIErrorNotice error={error} onRetry={() => generate(false)} />
        ) : (
          <p className="type-body text-lake-fg-muted max-w-2xl">
            {t('bookSummary.description')}
          </p>
        )}
        {error ? null : (
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Sparkles className="size-4" />}
            onClick={() => generate(false)}
          >
            {t('bookSummary.generate')}
          </Button>
        )}
      </div>
    )
  }

  const highlights = new Map(
    context?.highlights.map((item) => [item.ref, item])
  )
  const themes = summary?.themes ?? []
  const sampled = context?.highlights.length ?? 0
  const total = context?.total ?? 0

  return (
    <div
      aria-live="polite"
      aria-busy={isLoading}
      className="flex flex-col gap-6"
    >
      {error ? (
        <AIErrorNotice error={error} onRetry={() => generate(true)} />
      ) : null}

      <div
        className={cn(
          'flex flex-col gap-6 transition-opacity duration-200 motion-reduce:transition-none',
          // Asking again keeps the old summary visible until new words arrive.
          isLoading && !draft && 'opacity-50'
        )}
      >
        {summary?.thesis ? (
          <p className="type-title text-lake-fg max-w-4xl">{summary.thesis}</p>
        ) : (
          <div className="flex max-w-3xl flex-col gap-3">
            <p className="type-meta">{t('bookSummary.working')}</p>
            <Skeleton shape="text" lines={2} />
          </div>
        )}

        {themes.length > 0 || isLoading ? (
          <div
            className={cn(
              'border-lake-line grid gap-x-8 gap-y-6 border-t pt-6',
              themeColumns(themes.length || 3)
            )}
          >
            {themes.map((theme, index) => {
              const highlight =
                theme?.highlightRef === undefined
                  ? undefined
                  : highlights.get(theme.highlightRef)
              return (
                <section
                  key={index}
                  className="animate-in fade-in flex flex-col gap-2 duration-200 motion-reduce:animate-none"
                >
                  <h3 className="type-heading text-lake-fg">{theme?.title}</h3>
                  <p className="type-body text-lake-fg-muted">
                    {theme?.insight}
                  </p>
                  {highlight ? (
                    <Link
                      href={clippingHref(owner, highlight.id)}
                      aria-label={t('bookSummary.openHighlight')}
                      className="focus-visible:ring-lake-ring mt-1 block rounded-sm outline-none focus-visible:ring-2"
                    >
                      <blockquote className="type-quote text-lake-fg hover:text-lake-fg-muted border-marker-solid line-clamp-5 border-l-2 pl-3 transition-colors duration-150 motion-reduce:transition-none">
                        {highlight.text}
                      </blockquote>
                    </Link>
                  ) : null}
                </section>
              )
            })}
            {themes.length === 0
              ? Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} shape="text" lines={4} />
                ))
              : null}
          </div>
        ) : null}

        {summary?.question ? (
          <div className="flex flex-col gap-1">
            <p className="type-eyebrow">{t('bookSummary.question')}</p>
            <p className="type-quote-lg text-lake-fg italic">
              {summary.question}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-lake-line flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <p className="type-meta">
          {sampled > 0
            ? sampled < total
              ? t('bookSummary.provenance', { sampled, total })
              : t('bookSummary.provenanceAll', { count: total })
            : null}
        </p>
        <AIResultActions
          isLoading={isLoading}
          onStop={stop}
          onRewrite={() => generate(true)}
          copyText={() =>
            result
              ? bookSummaryToMarkdown(title, result.object, result.context)
              : ''
          }
        />
      </div>
    </div>
  )
}

function BookAiSummary(props: BookAiSummaryProps) {
  const { access, ...summary } = props
  const { t } = useTranslation(undefined, 'ai')
  const [open, setOpen] = useState(true)

  return (
    <details
      className="group rounded-lake-panel border-lake-line bg-lake-surface shadow-lake-card border"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="focus-visible:ring-lake-ring rounded-lake-panel flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 outline-none marker:hidden focus-visible:ring-2 md:px-7 [&::-webkit-details-marker]:hidden">
        <span className="type-eyebrow inline-flex items-center gap-2">
          <Sparkles
            className="text-lake-accent-text size-4"
            aria-hidden="true"
          />
          {access === 'premium'
            ? t('bookSummary.title')
            : t('bookSummary.premiumTitle')}
        </span>
        <ChevronDown
          className="text-lake-fg-subtle size-4 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5 md:px-7 md:pb-6">
        {access === 'free' ? (
          <AIPremiumPrompt description={t('bookSummary.premiumDescription')} />
        ) : (
          <PremiumSummary {...summary} />
        )}
      </div>
    </details>
  )
}

export default BookAiSummary
