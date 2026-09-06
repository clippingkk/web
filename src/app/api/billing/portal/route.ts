import { requireUserId } from '@/server/auth'
import { subjectBillingPath } from '@/server/gate/billing'
import { gateRequest } from '@/server/gate/client'
import { gateConfig } from '@/server/gate/config'
import { json, route } from '@/server/http'
export const POST = route(async (request) => {
  const path = await subjectBillingPath(await requireUserId(request))
  return json(
    await gateRequest(`${path}/portal`, {
      method: 'POST',
      body: JSON.stringify({
        environmentId: gateConfig().environmentId,
        returnUrl: `${gateConfig().appOrigin}/pricing`,
      }),
    })
  )
}, 'payment.gate.portal')
