import { requireUserId } from '@/server/auth'
import { getServerEnv } from '@/server/env'
import { ApiError } from '@/server/errors'
import { scheduleDeletion } from '@/server/gate/deletion'
import { cookie, SESSION_COOKIE } from '@/server/gate/security'
import { json, route } from '@/server/http'
export const POST = route(async (request) => {
  if (!getServerEnv().runWorker)
    throw new ApiError(
      'Account deletion worker is not enabled. Contact support.',
      503
    )
  await scheduleDeletion(await requireUserId(request))
  const response = json(
    {
      status: 'pending',
      message:
        'ClippingKK access is disabled. Data deletion is queued; your Gate account remains available.',
    },
    202
  )
  response.headers.append('Set-Cookie', cookie(SESSION_COOKIE, '', 0))
  return response
}, 'auth.gate.delete')
