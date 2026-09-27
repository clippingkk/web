'use client'

import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import Spinner from '@annatarhe/lake-ui/spinner'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Clock } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import type React from 'react'
import { useState } from 'react'

import { useTranslation } from '@/i18n/client'
import { getPaymentOrderInfo } from '@/services/payment'

const POLL_INTERVAL_MS = 3000
/** About a minute of checking before the page stops and says so. */
export const MAX_ATTEMPTS = 20

type PaymentSuccessContentProps = {
  sessionId: string
  libraryHref: Route
  subscriptionHref: Route
}

function PaymentSuccessContent(props: PaymentSuccessContentProps) {
  const { sessionId, libraryHref, subscriptionHref } = props
  const { t } = useTranslation(undefined, 'payment')
  const [attempts, setAttempts] = useState(0)
  const exhausted = attempts >= MAX_ATTEMPTS

  const { data } = useQuery({
    queryKey: ['payment', 'result', sessionId],
    queryFn: async () => {
      try {
        return await getPaymentOrderInfo(sessionId)
      } finally {
        setAttempts((n) => n + 1)
      }
    },
    // A failed check is just another attempt; the interval tries again.
    retry: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !exhausted,
    refetchInterval: (query) =>
      query.state.data?.premiumActive ? false : POLL_INTERVAL_MS,
    // Readers switch tabs while Stripe finishes; the attempt limit bounds it.
    refetchIntervalInBackground: true,
  })

  const active = data?.premiumActive === true

  const links = (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="primary" render={<Link href={libraryHref} />}>
        {t('success.library')}
      </Button>
      <Button variant="ghost" render={<Link href={subscriptionHref} />}>
        {t('success.subscription')}
      </Button>
    </div>
  )

  let state: React.ReactNode
  if (active) {
    state = (
      <EmptyState
        headingLevel={1}
        icon={<BadgeCheck className="text-lake-success size-6" />}
        title={t('success.active.title')}
        description={t('success.active.description')}
        action={links}
      />
    )
  } else if (exhausted) {
    state = (
      <EmptyState
        headingLevel={1}
        icon={<Clock className="size-6" />}
        title={t('success.pending.title')}
        description={t('success.pending.description')}
        action={links}
      />
    )
  } else {
    state = (
      <EmptyState
        headingLevel={1}
        icon={<Spinner size="md" />}
        title={t('success.confirming.title')}
        description={t('success.confirming.description')}
      />
    )
  }

  return <div aria-live="polite">{state}</div>
}

export default PaymentSuccessContent
