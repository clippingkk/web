import { eq } from 'drizzle-orm'

import { getDatabase } from '@/server/db'
import { users } from '@/server/db/schema'
import { getServerEnv } from '@/server/env'
import { ApiError } from '@/server/errors'
import { route } from '@/server/http'
import { cacheDelete, cacheGet } from '@/server/redis'

export const GET = route(async (request) => {
  const code = new URL(request.url).searchParams.get('code')
  if (!code) throw new ApiError('code required')
  const userId = Number(await cacheGet<number>(`auth:signup:mail:${code}`))
  if (!userId) throw new ApiError('verification code expired', 403)
  await getDatabase()
    .db.update(users)
    .set({ checked: true, updatedAt: new Date() })
    .where(eq(users.id, userId))
  await cacheDelete(`auth:signup:mail:${code}`)
  return Response.redirect(
    `${getServerEnv().APP_ORIGIN}/auth/signin?checked=true`,
    307
  )
}, 'auth.email.verify')
