'use client'

import Button from '@annatarhe/lake-ui/button'
import Progress from '@annatarhe/lake-ui/progress'
import Spinner from '@annatarhe/lake-ui/spinner'
import { Check, CircleAlert, PartyPopper } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'

import Callout from '@/components/layout/callout'
import type { ImportError, ImportResult } from '@/hooks/use-clippings-import'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { IMPORT_STEPS, stepIndex, UploadStep } from '@/services/uploader'

type ImportProgressProps = {
  step: UploadStep
  at: number
  count: number
  errors: ImportError[]
  result: ImportResult | null
  /** Where a failed import stopped; the steps before it did finish. */
  failedStep?: UploadStep | null
  libraryHref: Route
  onReset: () => void
}

function ImportProgress(props: ImportProgressProps) {
  const { step, at, count, errors, result, failedStep, libraryHref, onReset } =
    props
  const { t } = useTranslation(undefined, 'import')
  const current = stepIndex(step)
  const failed = step === UploadStep.Error
  const reached = failed ? stepIndex(failedStep ?? UploadStep.Parse) : current

  const progressLabel =
    step === UploadStep.Parse
      ? t('progress.parse')
      : step === UploadStep.SearchingBook
        ? t('progress.searchingBook', { at, count })
        : step === UploadStep.Uploading
          ? t('progress.uploading', { at, count })
          : ''

  return (
    <div className="flex flex-col gap-6">
      <ol aria-label={t('steps.label')} className="grid grid-cols-4 gap-2">
        {IMPORT_STEPS.map((s, index) => {
          const done = step === UploadStep.Done || index < reached
          const active =
            !failed && index === current && step !== UploadStep.Done
          const broken = failed && index === reached
          return (
            <li
              key={s}
              aria-current={active ? 'step' : undefined}
              className="flex flex-col gap-2"
            >
              <span
                className={cn(
                  'h-1 rounded-full transition-colors duration-200',
                  broken
                    ? 'bg-lake-danger'
                    : done || active
                      ? 'bg-lake-accent'
                      : 'bg-lake-line'
                )}
              />
              <span
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium sm:text-sm',
                  done || active || broken
                    ? 'text-lake-fg'
                    : 'text-lake-fg-subtle'
                )}
              >
                {broken ? (
                  <CircleAlert
                    className="text-lake-danger size-3.5"
                    aria-hidden="true"
                  />
                ) : done ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : active ? (
                  <Spinner size="xs" />
                ) : null}
                {t(`steps.${s}`)}
              </span>
            </li>
          )
        })}
      </ol>

      {progressLabel ? (
        <Progress
          label={progressLabel}
          showValue
          value={
            step === UploadStep.Parse || count === 0
              ? null
              : Math.round((at / count) * 100)
          }
        />
      ) : null}

      {failed ? (
        <Callout
          tone="warning"
          icon={<CircleAlert />}
          title={t('errors.title')}
          description={
            <span className="flex flex-col gap-1">
              {[...new Set(errors.map((error) => error.kind))].map((kind) => (
                <span key={kind}>{t(`errors.${kind}`)}</span>
              ))}
            </span>
          }
          action={
            <Button variant="secondary" size="sm" onClick={onReset}>
              {t('errors.retry')}
            </Button>
          }
        />
      ) : null}

      {step === UploadStep.Done && result ? (
        <div className="rounded-lake-panel border-lake-line bg-lake-surface flex flex-col items-center gap-3 border px-6 py-10 text-center">
          <PartyPopper
            className="text-lake-accent-text size-8"
            aria-hidden="true"
          />
          <h2 className="type-heading text-lake-fg">
            {result.imported > 0
              ? t('done.title', { count: result.imported })
              : t('done.nothingNew')}
          </h2>
          {result.duplicates > 0 ? (
            <p className="text-lake-fg-muted text-sm">
              {t('done.duplicates', { count: result.duplicates })}
            </p>
          ) : null}
          {errors.some((e) => e.kind === 'search') ? (
            <p className="text-lake-fg-muted text-sm">{t('errors.search')}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button variant="primary" render={<Link href={libraryHref} />}>
              {t('done.openLibrary')}
            </Button>
            <Button variant="ghost" onClick={onReset}>
              {t('done.another')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ImportProgress
