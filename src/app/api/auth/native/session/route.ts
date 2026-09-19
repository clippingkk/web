import { nativeUser, profile } from '@/server/gate/native'
import { route } from '@/server/http'

import { credential, noStore } from '../shared'

export const GET = route(
  async (request) =>
    noStore({ user: profile(await nativeUser(credential(request))) }),
  'auth.native.session'
)
