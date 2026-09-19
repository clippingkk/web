import { z } from 'zod'

import { ApiError } from '@/server/errors'
import { startNative } from '@/server/gate/native'
import { route } from '@/server/http'
import { rateLimit } from '@/server/redis'

import { body, noStore } from '../shared'

const schema = z.object({ challenge: z.string().max(128) }).strict()

export const POST = route(async (request) => {
  // Unauthenticated and writes to Redis, so bound it globally per minute.
  if (!(await rateLimit('ck:native:start', 600, 60)).allowed)
    throw new ApiError('Too many sign-in attempts. Retry shortly.', 429)
  const { challenge } = await body(request, schema)
  return noStore(await startNative(challenge))
}, 'auth.native.start')
