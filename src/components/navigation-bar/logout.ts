'use server'

import { USER_ID_KEY, COOKIE_TOKEN_KEY } from '@/constants/storage'
import { cookies } from 'next/headers'

// remove cookies on server
export async function onCleanServerCookie() {
  'use server'
  const cs = await cookies()
  cs.delete(COOKIE_TOKEN_KEY)
  cs.delete(USER_ID_KEY)
}

