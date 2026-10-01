import { requireUserId } from '@/server/auth'
import { billingPortal } from '@/server/billing/gate'
import { json, options, route } from '@/server/http'

export const POST = route(
  async (request) => json(await billingPortal(await requireUserId(request))),
  'payment.gate.portal'
)
export const OPTIONS = options
