'use client'

import Button from '@annatarhe/lake-ui/button'
import Skeleton from '@annatarhe/lake-ui/skeleton'
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import AIErrorNotice from '@/components/ai/ai-error-notice'
import AIPremiumPrompt from '@/components/ai/ai-premium-prompt'
import AIResultActions from '@/components/ai/ai-result-actions'
import { useAIObject, type AIResult } from '@/hooks/use-ai-object'
import { useTranslation } from '@/i18n/client'
import { getLanguage } from '@/i18n/language'
import { passageNoteToText } from '@/lib/ai/format'
import { passageNoteSchema, type PassageNote } from '@/lib/ai/schemas'
import { cn } from '@/lib/utils'

type PassageNotePanelProps = {
  clippingId: number
  /** Signed-out readers see nothing; free readers see the Premium upsell. */
  access: 'anonymous' | 'free' | 'premium'
  /** A stored note for this passage. Showing it does not call the model. */
  initial: AIResult<PassageNote, null> | null
}

function NoteSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <section className="animate-in fade-in flex flex-col gap-1 duration-200 motion-reduce:animate-none">
      <h3 className="type-eyebrow">{label}</h3>
      {children}
    </section>
  )
}

function PremiumNote({
  clippingId,
  initial,
}: Omit<PassageNotePanelProps, 'access'>) {
  const { t } = useTranslation(undefined, 'ai')
  const ai = useAIObject<typeof passageNoteSchema>({
    kind: 'passage',
    schema: passageNoteSchema,
    threadId: `passage-note:${clippingId}`,
    initial,
  })
  const { result, draft, isLoading, error, stop } = ai
  const generate = (force: boolean) =>
    ai.generate({ clippingId, language: getLanguage(), force })
  const note = draft ?? result?.object ?? null

  if (!note && !isLoading) {
    return error ? (
      <AIErrorNotice error={error} onRetry={() => generate(false)} />
    ) : (
      <>
        <p className="type-body text-lake-fg-muted">
          {t('passageNote.description')}
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          leadingIcon={<Sparkles className="size-4" />}
          onClick={() => generate(false)}
        >
          {t('passageNote.generate')}
        </Button>
      </>
    )
  }

  const terms = note?.terms ?? []

  return (
    <div
      aria-live="polite"
      aria-busy={isLoading}
      className="flex flex-col gap-4"
    >
      {error ? (
        <AIErrorNotice error={error} onRetry={() => generate(true)} />
      ) : null}
      <div
        className={cn(
          'flex flex-col gap-4 transition-opacity duration-200 motion-reduce:transition-none',
          isLoading && !draft && 'opacity-50'
        )}
      >
        {note?.gist ? (
          <p className="type-quote text-lake-fg">{note.gist}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="type-meta">{t('passageNote.working')}</p>
            <Skeleton shape="text" lines={3} />
          </div>
        )}
        {note?.reading ? (
          <NoteSection label={t('passageNote.reading')}>
            <p className="type-body text-lake-fg-muted">{note.reading}</p>
          </NoteSection>
        ) : null}
        {note?.context ? (
          <NoteSection label={t('passageNote.context')}>
            <p className="type-body text-lake-fg-muted">{note.context}</p>
          </NoteSection>
        ) : null}
        {terms.length > 0 ? (
          <NoteSection label={t('passageNote.terms')}>
            <dl className="flex flex-col gap-1.5">
              {terms.map((item, index) => (
                <div key={index}>
                  <dt className="text-lake-fg text-sm font-medium">
                    {item?.term}
                  </dt>
                  <dd className="type-body text-lake-fg-muted">
                    {item?.meaning}
                  </dd>
                </div>
              ))}
            </dl>
          </NoteSection>
        ) : null}
        {note?.question ? (
          <NoteSection label={t('passageNote.question')}>
            <p className="type-quote text-lake-fg italic">{note.question}</p>
          </NoteSection>
        ) : null}
      </div>
      <div className="border-lake-line flex flex-col gap-2 border-t pt-3">
        <p className="type-meta">{t('actions.disclaimer')}</p>
        <AIResultActions
          isLoading={isLoading}
          onStop={stop}
          onRewrite={() => generate(true)}
          copyText={() => (result ? passageNoteToText(result.object) : '')}
        />
      </div>
    </div>
  )
}

function PassageNotePanel({ access, ...note }: PassageNotePanelProps) {
  const { t } = useTranslation(undefined, 'ai')
  if (access === 'anonymous') return null

  return (
    <section
      aria-labelledby="ai-note-title"
      className="rounded-lake-panel border-lake-line bg-lake-surface shadow-lake-card flex flex-col gap-3 border p-5"
    >
      <h2
        id="ai-note-title"
        className="type-eyebrow inline-flex items-center gap-2"
      >
        <Sparkles className="text-lake-accent-text size-4" aria-hidden="true" />
        {access === 'premium'
          ? t('passageNote.title')
          : t('passageNote.premiumTitle')}
      </h2>
      {access === 'free' ? (
        <AIPremiumPrompt description={t('passageNote.premiumDescription')} />
      ) : (
        <PremiumNote {...note} />
      )}
    </section>
  )
}

export default PassageNotePanel
