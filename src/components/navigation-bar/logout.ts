'use server'

import { cookies } from 'next/headers'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'

// remove cookies on server
export async function onCleanServerCookie() {
  'use server'
  const cs = await cookies()
  cs.delete(COOKIE_TOKEN_KEY)
  cs.delete(USER_ID_KEY)
}
