'use client'

import Button from '@annatarhe/lake-ui/button'
import Spinner from '@annatarhe/lake-ui/spinner'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useAIGeneration } from '@/hooks/use-ai-generation'
import { useTranslation } from '@/i18n/client'
import { getLanguage } from '@/i18n/language'
import type { WenquBook } from '@/services/wenqu'

type AISummaryPanelProps = {
  clippingId: number
  book: WenquBook | null
  /** Signed-out readers see nothing; free readers see the Premium upsell. */
  access: 'anonymous' | 'free' | 'premium'
}

function AISummaryPanel({ clippingId, book, access }: AISummaryPanelProps) {
  const { t } = useTranslation(undefined, 'reading')
  const [run, setRun] = useState(0)
  const enabled = access === 'premium' && run > 0 && !!book
  const { text, isLoading, error } = useAIGeneration(
    'passage',
    {
      clippingId,
      language: getLanguage(),
      run,
      book: {
        title: book?.title ?? '',
        author: book?.author ?? '',
        summary: book?.summary ?? '',
        pubdate: book?.pubdate ?? '',
        url: book?.url ?? '',
        isbn: book?.isbn ?? '',
      },
    },
    enabled
  )

  if (access === 'anonymous') return null

  return (
    <section
      aria-labelledby="ai-note-title"
      className="rounded-lake-panel border-lake-line bg-lake-surface flex flex-col gap-3 border p-5"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="text-lake-accent-text size-4" aria-hidden="true" />
        <h2 id="ai-note-title" className="text-lake-fg text-sm font-semibold">
          {access === 'premium' ? t('ai.title') : t('ai.premiumTitle')}
        </h2>
      </div>

      {access === 'free' ? (
        <>
          <p className="text-lake-fg-muted text-sm">
            {t('ai.premiumDescription')}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="w-fit"
            render={<Link href="/pricing" />}
          >
            {t('ai.upgrade')}
          </Button>
        </>
      ) : !book ? (
        <p className="text-lake-fg-muted text-sm">{t('ai.noBook')}</p>
      ) : run === 0 ? (
        <>
          <p className="text-lake-fg-muted text-sm">{t('ai.description')}</p>
          <Button
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() => setRun(1)}
          >
            {t('ai.generate')}
          </Button>
        </>
      ) : (
        <div aria-live="polite" className="flex flex-col gap-3">
          {error ? (
            <p className="text-lake-danger text-sm">
              {error.message || t('ai.error')}
            </p>
          ) : text ? (
            <p className="text-lake-fg text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
          ) : null}
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => setRun((n) => n + 1)}
            >
              {t('ai.regenerate')}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

export default AISummaryPanel
