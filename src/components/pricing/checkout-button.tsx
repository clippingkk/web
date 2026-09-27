'use client'

import Button from '@annatarhe/lake-ui/button'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'

type CheckoutButtonProps = {
  signedIn: boolean
  /** Opens the billing portal (manage/cancel) instead of a new checkout. */
  portal?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export default function CheckoutButton({
  signedIn,
  portal = false,
  variant,
  size = 'md',
  fullWidth = false,
}: CheckoutButtonProps) {
  const { t } = useTranslation(undefined, 'pricing')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // One key per attempt on this page, so a double click cannot open two
  // checkout sessions.
  const key = useRef<string | null>(null)
  const pathname = usePathname()

  async function open() {
    if (!signedIn) {
      window.location.assign(authHref(pathname ?? '/pricing'))
      return
    }
    setBusy(true)
    setError('')
    key.current ??= crypto.randomUUID()
    try {
      const response = await fetch(
        portal ? '/api/billing/portal' : '/api/v2/payment-subscription',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'idempotency-key': key.current,
          },
          body: '{}',
        }
      )
      const result = await response.json()
      if (!response.ok) throw new Error(result.msg || t('checkout.unavailable'))
      window.location.assign(result.data.checkoutUrl ?? result.data.url)
    } catch (error) {
      setError(error instanceof Error ? error.message : t('checkout.failed'))
      setBusy(false)
    }
  }

  const label = portal
    ? t('checkout.manage')
    : signedIn
      ? t('checkout.upgrade')
      : t('checkout.signIn')

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={variant ?? (portal ? 'secondary' : 'primary')}
        size={size}
        fullWidth={fullWidth}
        loading={busy}
        disabled={busy}
        onClick={open}
      >
        {busy ? t('checkout.opening') : label}
      </Button>
      {error ? (
        <p role="alert" className="text-lake-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
