import { requireUserId } from '@/server/auth'
import { scheduleDeletion } from '@/server/gate/deletion'
import { cookie, SESSION_COOKIE } from '@/server/gate/security'
import { json, route } from '@/server/http'
export const POST = route(async (request) => {
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
