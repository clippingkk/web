'use client'
import { useRef, useState } from 'react'
export default function CheckoutButton({
  signedIn,
  portal = false,
}: {
  signedIn: boolean
  portal?: boolean
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const key = useRef<string | null>(null)
  async function open() {
    if (!signedIn) {
      window.location.assign('/auth?next=/pricing')
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
      if (!response.ok)
        throw new Error(result.msg || 'Checkout unavailable. Please try again.')
      window.location.assign(result.data.checkoutUrl ?? result.data.url)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.')
      setBusy(false)
    }
  }
  return (
    <div>
      <button
        disabled={busy}
        onClick={open}
        className="w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white disabled:opacity-50"
      >
        {busy
          ? 'Opening…'
          : portal
            ? 'Manage subscription'
            : 'Upgrade to Premium'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
