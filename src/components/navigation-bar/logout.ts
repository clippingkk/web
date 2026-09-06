'use server'
import { cookies } from 'next/headers'

import { SESSION_COOKIE } from '@/server/gate/security'
import { destroySession } from '@/server/gate/session'
export async function onCleanServerCookie() {
  const jar = await cookies()
  await destroySession(jar.get(SESSION_COOKIE)?.value ?? '')
  for (const key of [SESSION_COOKIE, 'ck-token', 'ck-uid']) jar.delete(key)
}
