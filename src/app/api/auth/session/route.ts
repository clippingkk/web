import { cookieValue } from '@/server/gate/security'
import { readSession } from '@/server/gate/session'
import { json, route } from '@/server/http'
export const GET = route(async (request) => {
  const session = await readSession(cookieValue(request))
  const response = json(session ? { userId: session.localUserId } : null)
  response.headers.set('Cache-Control', 'no-store')
  return response
}, 'auth.gate.session')
