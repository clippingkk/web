import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { subjectBillingPath } from '@/server/gate/billing'
import { gateRequest } from '@/server/gate/client'
import { gateConfig } from '@/server/gate/config'
import { body, json, options, route } from '@/server/http'
export const DELETE = route(async (request) => {
  const uid = await requireUserId(request),
    { subscriptionId } = await body<{ subscriptionId: string }>(request)
  if (!subscriptionId) throw new ApiError('subscriptionId required')
  return json(
    await gateRequest(`${await subjectBillingPath(uid)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({
        subscriptionId,
        environmentId: gateConfig().environmentId,
      }),
    })
  )
}, 'payment.gate.cancel')
export const OPTIONS = options
