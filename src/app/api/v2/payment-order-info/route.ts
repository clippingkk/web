import { eq } from 'drizzle-orm'

import type { PaymentOrderInfoResponse } from '@/contracts/http'
import { requireUserId } from '@/server/auth'
import { getDatabase } from '@/server/db'
import { users } from '@/server/db/schema'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'
import { getStripe } from '@/server/integrations'

const KNOWN_PAYMENT_STATUSES: readonly PaymentOrderInfoResponse['paymentStatus'][] =
  ['paid', 'unpaid', 'no_payment_required']

// Stripe's PaymentStatus is an open string union so new API values don't break
// the SDK's types. Anything we don't recognise is reported as unpaid, which is
// what every caller already treats a non-'paid' status as.
function toPaymentStatus(
  value: string
): PaymentOrderInfoResponse['paymentStatus'] {
  return (KNOWN_PAYMENT_STATUSES as readonly string[]).includes(value)
    ? (value as PaymentOrderInfoResponse['paymentStatus'])
    : 'unpaid'
}

export const GET = route(async (request) => {
  const uid = await requireUserId(request)
  const sessionId = new URL(request.url).searchParams.get('sessionId')
  if (!sessionId) throw new ApiError('sessionId required')
  const session = await getStripe().checkout.sessions.retrieve(sessionId)
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : (session.customer?.id ?? '')
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId),
  })
  if (!user || user.id !== uid)
    throw new ApiError('payment does not belong to you', 403)
  return json<PaymentOrderInfoResponse>({
    uid: user.id,
    amount: session.amount_total,
    paymentStatus: toPaymentStatus(session.payment_status),
  })
}, 'payment.order.read')
export const OPTIONS = options
