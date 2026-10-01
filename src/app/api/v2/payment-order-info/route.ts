import { requireUserId } from '@/server/auth'
import { checkoutStatus } from '@/server/billing/gate'
import { isPremium } from '@/server/billing/premium'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'

export const GET = route(async (request) => {
  const uid = await requireUserId(request),
    sessionId = new URL(request.url).searchParams.get('sessionId')
  if (!sessionId) throw new ApiError('sessionId required')
  const [status, premiumActive] = await Promise.all([
    checkoutStatus(uid, sessionId),
    isPremium(uid),
  ])
  return json({ uid, ...status, premiumActive })
}, 'payment.gate.status')
export const OPTIONS = options
