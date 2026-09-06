import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { entitlements } from '@/server/gate/authz'
import { checkoutStatus } from '@/server/gate/billing'
import { json, options, route } from '@/server/http'
export const GET = route(async (request) => {
  const uid = await requireUserId(request),
    sessionId = new URL(request.url).searchParams.get('sessionId')
  if (!sessionId) throw new ApiError('sessionId required')
  const status = await checkoutStatus(uid, sessionId)
  return json({
    uid,
    ...status,
    premiumActive: (await entitlements(uid)).premium === true,
  })
}, 'payment.gate.status')
export const OPTIONS = options
