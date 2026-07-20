import { eq } from 'drizzle-orm'

import { optionalUserId } from '@/server/auth'
import { getDatabase } from '@/server/db'
import { users } from '@/server/db/schema'
import { ApiError } from '@/server/errors'
import { options, route } from '@/server/http'

export const POST = route(async (request) => {
  if (!request.headers.get('user-agent')?.startsWith('PromptPal@')) {
    throw new ApiError('Only PromptPal Client is allowed', 403)
  }
  const uid = await optionalUserId(request)
  if (!uid) throw new ApiError('unauthorized', 401)
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.id, uid),
  })
  if (!user) throw new ApiError('user not found', 404)
  const active = Boolean(user.premiumEndAt && user.premiumEndAt > new Date())
  return Response.json({ limit: 1000, remaining: active ? 1000 : 0 })
})
export const OPTIONS = options
