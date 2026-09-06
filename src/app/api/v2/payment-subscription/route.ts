import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { createCheckout } from '@/server/gate/billing'
import { json, options, route } from '@/server/http'
export const POST = route(async (request) => {
  const uid = await requireUserId(request)
  const key = request.headers.get('idempotency-key') ?? undefined
  if (key && (key.length < 16 || key.length > 255))
    throw new ApiError('Invalid idempotency key')
  const session = await createCheckout(
    uid,
    key ? `ck-${uid}-${key}` : undefined
  )
  if (!session.url) throw new ApiError('Checkout unavailable', 503)
  return json({ checkoutUrl: session.url })
}, 'payment.gate.checkout')
export const OPTIONS = options
