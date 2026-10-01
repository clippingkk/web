import { requireUserId } from '@/server/auth'
import { billingState } from '@/server/billing/state'
import { json, options, route } from '@/server/http'

export const GET = route(async (request) => {
  const response = json(await billingState(await requireUserId(request)))
  response.headers.set('Cache-Control', 'no-store')
  return response
}, 'payment.gate.subscriptions')
export const OPTIONS = options
