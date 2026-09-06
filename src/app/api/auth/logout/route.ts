import {
  cookie,
  cookieValue,
  SESSION_COOKIE,
  assertSameOrigin,
} from '@/server/gate/security'
import { destroySession } from '@/server/gate/session'
import { json, route } from '@/server/http'
export const POST = route(async (request) => {
  assertSameOrigin(request)
  await destroySession(cookieValue(request))
  const response = json({ redirectTo: '/' })
  for (const name of [SESSION_COOKIE, 'ck-token', 'ck-uid', 'ck-oidc'])
    response.headers.append('Set-Cookie', cookie(name, '', 0))
  return response
}, 'auth.gate.logout')
