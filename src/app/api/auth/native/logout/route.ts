import { destroyNativeSession, nativeCredential } from '@/server/gate/native'
import { route } from '@/server/http'

import { noStore } from '../shared'

export const POST = route(async (request) => {
  // Always succeeds: the app has already dropped the credential by now.
  const token = nativeCredential(request)
  if (token) await destroyNativeSession(token)
  return noStore({ ok: true })
}, 'auth.native.logout')
