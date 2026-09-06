import { requireUserId } from '@/server/auth'
import { subjectBillingPath } from '@/server/gate/billing'
import { gateRequest } from '@/server/gate/client'
import { gateConfig } from '@/server/gate/config'
import { json, route } from '@/server/http'
export const GET = route(
  async (request) =>
    json(
      await gateRequest(
        `${await subjectBillingPath(await requireUserId(request))}?environmentId=${gateConfig().environmentId}`
      )
    ),
  'payment.gate.subscriptions'
)
