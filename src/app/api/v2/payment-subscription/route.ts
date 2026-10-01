import { requireUserId } from '@/server/auth'
import { createCheckout } from '@/server/billing/gate'
import { isPremium } from '@/server/billing/premium'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'

export const POST = route(async (request) => {
  const uid = await requireUserId(request)
  const key = request.headers.get('idempotency-key') ?? undefined
  if (key && (key.length < 16 || key.length > 255))
    throw new ApiError('Invalid idempotency key')
  // Gate would happily open a second subscription; a reader who already has
  // Premium (from Stripe or the App Store) manages it instead.
  if (await isPremium(uid))
    throw new ApiError('You already have Premium.', 409, 'ALREADY_PREMIUM')
  const session = await createCheckout(
    uid,
    key ? `ck-${uid}-${key}` : undefined
  )
  if (!session.url) throw new ApiError('Checkout unavailable', 503)
  return json({ checkoutUrl: session.url })
}, 'payment.gate.checkout')
export const OPTIONS = options
