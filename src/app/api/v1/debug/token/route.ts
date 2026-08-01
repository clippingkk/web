import { eq } from 'drizzle-orm'

import { issueToken } from '@/server/auth'
import { getDatabase } from '@/server/db'
import { users } from '@/server/db/schema'
import { getServerEnv } from '@/server/env'
import { ApiError } from '@/server/errors'
import { json, route } from '@/server/http'

export const GET = route(async (request) => {
  if (!getServerEnv().debug) throw new ApiError('not found', 404)
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!Number.isInteger(id) || id <= 0) throw new ApiError('id required')
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.id, id),
  })
  if (!user) throw new ApiError('user not found', 404)
  return json({ token: await issueToken(id) })
}, 'auth.debug_token.issue')
