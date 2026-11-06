'use client'

import Button from '@annatarhe/lake-ui/button'
import Sheet from '@annatarhe/lake-ui/sheet'
import Skeleton from '@annatarhe/lake-ui/skeleton'
import { Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'

import AIErrorNotice from '@/components/ai/ai-error-notice'
import AIPremiumPrompt from '@/components/ai/ai-premium-prompt'
import AIResultActions from '@/components/ai/ai-result-actions'
import { useAIObject } from '@/hooks/use-ai-object'
import { useTranslation } from '@/i18n/client'
import { getLanguage } from '@/i18n/language'
import { recommendationsToMarkdown } from '@/lib/ai/format'
import {
  recommendationsSchema,
  type RecommendationsContext,
} from '@/lib/ai/schemas'
import { cn } from '@/lib/utils'
import type { SlugSource } from '@/utils/profile.utils'

import RecommendationPick from './recommendation-pick'

const SHEET_WIDTH = 'max-w-xl'
const EXPECTED_PICKS = 5

function PickSkeleton() {
  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <Skeleton shape="rect" className="aspect-[2/3] w-16 shrink-0 sm:w-20" />
      <div className="flex-1">
        <Skeleton shape="text" lines={4} />
      </div>
    </li>
  )
}

function RecommendButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation(undefined, 'ai')
  return (
    <Button
      variant="secondary"
      size="sm"
      leadingIcon={<Sparkles className="size-4" />}
      onClick={onClick}
    >
      {t('recommendations.open')}
    </Button>
  )
}

function FreeRecommendations() {
  const { t } = useTranslation(undefined, 'ai')
  const [open, setOpen] = useState(false)
  return (
    <>
      <RecommendButton onClick={() => setOpen(true)} />
      <Sheet
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('recommendations.premiumTitle')}
        width={SHEET_WIDTH}
      >
        <AIPremiumPrompt
          description={t('recommendations.premiumDescription')}
        />
      </Sheet>
    </>
  )
}

function PremiumRecommendations({ owner }: { owner: SlugSource }) {
  const { t } = useTranslation(undefined, 'ai')
  const [open, setOpen] = useState(false)
  const ai = useAIObject<typeof recommendationsSchema, RecommendationsContext>({
    kind: 'recommendations',
    schema: recommendationsSchema,
    threadId: 'recommendations',
  })
  const { result, draft, context, isLoading, error, stop } = ai
  const generate = (force: boolean) =>
    ai.generate({ language: getLanguage(), force })
  const list = draft ?? result?.object ?? null
  const picks = list?.picks ?? []
  const top = useRef<HTMLDivElement>(null)
  // The list keeps streaming if the sheet is closed, so reopening costs nothing.
  const onOpen = () => {
    setOpen(true)
    if (!result && !isLoading) generate(false)
  }

  return (
    <>
      <RecommendButton onClick={onOpen} />
      <Sheet
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('recommendations.title')}
        width={SHEET_WIDTH}
        footer={
          list ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <p className="type-meta">{t('actions.disclaimer')}</p>
              <AIResultActions
                isLoading={isLoading}
                onStop={stop}
                onRewrite={() => {
                  // The new list starts at the top, however far down the reader was.
                  top.current?.scrollIntoView({ block: 'start' })
                  generate(true)
                }}
                copyText={() =>
                  result
                    ? recommendationsToMarkdown(
                        t('recommendations.title'),
                        result.object
                      )
                    : ''
                }
              />
            </div>
          ) : undefined
        }
      >
        <div
          ref={top}
          aria-live="polite"
          aria-busy={isLoading}
          className="flex flex-col gap-5"
        >
          {error ? (
            <AIErrorNotice
              error={error}
              onRetry={() => generate(Boolean(result))}
            />
          ) : null}
          <div
            className={cn(
              'flex flex-col gap-5 transition-opacity duration-200 motion-reduce:transition-none',
              isLoading && !draft && list && 'opacity-50'
            )}
          >
            {list?.portrait ? (
              <p className="type-quote-lg text-lake-fg">{list.portrait}</p>
            ) : isLoading ? (
              <div className="flex flex-col gap-3">
                <p className="type-meta">{t('recommendations.working')}</p>
                <Skeleton shape="text" lines={2} />
              </div>
            ) : null}
            {picks.length > 0 || isLoading ? (
              <ol className="divide-lake-line border-lake-line flex flex-col divide-y border-t pt-5">
                {picks.map((pick, index) => (
                  <RecommendationPick
                    key={index}
                    pick={pick ?? {}}
                    finished={!draft}
                    shelf={context?.shelf ?? []}
                    owner={owner}
                  />
                ))}
                {isLoading
                  ? Array.from(
                      { length: Math.max(EXPECTED_PICKS - picks.length, 0) },
                      (_, index) => <PickSkeleton key={index} />
                    )
                  : null}
              </ol>
            ) : null}
          </div>
        </div>
      </Sheet>
    </>
  )
}

type AIBookRecommendationButtonProps = {
  owner: SlugSource
  isPremium: boolean
}

function AIBookRecommendationButton(props: AIBookRecommendationButtonProps) {
  return props.isPremium ? (
    <PremiumRecommendations owner={props.owner} />
  ) : (
    <FreeRecommendations />
  )
}

export default AIBookRecommendationButton
