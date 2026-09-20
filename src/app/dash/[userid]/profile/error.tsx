'use client'

import ErrorState from '@/components/error-state/error-state'
import { useTranslation } from '@/i18n/client'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  return (
    <ErrorState
      error={error}
      reset={reset}
      title={t('app.profile.error.title')}
      description={t('app.profile.error.description')}
    />
  )
}
