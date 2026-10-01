import { requireUserId } from '@/server/auth'
import { cancelSubscription } from '@/server/billing/gate'
import { ApiError } from '@/server/errors'
import { body, json, options, route } from '@/server/http'

export const DELETE = route(async (request) => {
  const uid = await requireUserId(request),
    { subscriptionId } = await body<{ subscriptionId: string }>(request)
  if (!subscriptionId) throw new ApiError('subscriptionId required')
  return json(await cancelSubscription(uid, subscriptionId))
}, 'payment.gate.cancel')
export const OPTIONS = options
