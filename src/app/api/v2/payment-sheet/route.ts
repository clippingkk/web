import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { route } from '@/server/http'
export const POST = route(async (request) => {
  await requireUserId(request)
  throw new ApiError(
    'Upgrade your client and manage billing through Gate.',
    410,
    'GATE_UPGRADE_REQUIRED'
  )
}, 'payment.legacy.retired')
