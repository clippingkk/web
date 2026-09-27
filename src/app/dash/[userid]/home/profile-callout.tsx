'use client'

import Button from '@annatarhe/lake-ui/button'
import { UserRoundPen } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useCallback, useSyncExternalStore } from 'react'

import Callout from '@/components/layout/callout'
import { useTranslation } from '@/i18n/client'

const STORAGE_KEY = 'ck.library.profile-callout.dismissed'
const listeners = new Set<() => void>()

function readDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

type ProfileCalloutProps = {
  editHref: Route
}

/** Replaces the old onboarding wizard with a quiet, dismissible nudge. */
function ProfileCallout({ editHref }: ProfileCalloutProps) {
  const { t } = useTranslation(undefined, 'library')
  // Hidden on the server; shown after hydration unless dismissed earlier.
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true)

  const onDismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // storage can be unavailable (private mode); hiding for now is enough
    }
    for (const listener of listeners) listener()
  }, [])

  if (dismissed) return null

  return (
    <Callout
      tone="neutral"
      icon={<UserRoundPen />}
      title={t('home.profile.title')}
      description={t('home.profile.description')}
      action={
        <Button size="sm" variant="secondary" render={<Link href={editHref} />}>
          {t('home.profile.action')}
        </Button>
      }
      onDismiss={onDismiss}
      dismissLabel={t('home.profile.dismiss')}
    />
  )
}

export default ProfileCallout
