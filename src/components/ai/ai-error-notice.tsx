'use client'

import Button from '@annatarhe/lake-ui/button'

import { useTranslation } from '@/i18n/client'

const KNOWN_CODES = [
  'UNAUTHORIZED',
  'PREMIUM_REQUIRED',
  'AI_UNAVAILABLE',
  'NOT_FOUND',
] as const

type AIErrorNoticeProps = {
  error: Error & { code?: string }
  onRetry: () => void
}

/** A translated message and a way forward. The server's own text stays in English. */
function AIErrorNotice({ error, onRetry }: AIErrorNoticeProps) {
  const { t } = useTranslation(undefined, 'ai')
  const code = KNOWN_CODES.find((item) => item === error.code)

  return (
    <div
      role="alert"
      className="rounded-lake-control bg-lake-danger-soft flex flex-wrap items-center justify-between gap-2 px-3 py-2"
    >
      <p className="text-lake-danger text-sm">
        {t(code ? `errors.${code}` : 'errors.generic')}
      </p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        {t('actions.retry')}
      </Button>
    </div>
  )
}

export default AIErrorNotice
