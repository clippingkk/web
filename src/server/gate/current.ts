import { cookies } from 'next/headers'
import { cache } from 'react'

import { SESSION_COOKIE } from './security'
import { readSession } from './session'
export const currentSession = cache(async () =>
  readSession((await cookies()).get(SESSION_COOKIE)?.value ?? '')
)
export async function currentUserId() {
  return (await currentSession())?.localUserId
}
