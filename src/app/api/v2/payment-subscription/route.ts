import { eq } from 'drizzle-orm'

import { requireUserId } from '@/server/auth'
import { getDatabase } from '@/server/db'
import { users } from '@/server/db/schema'
import { getServerEnv } from '@/server/env'
import { ApiError } from '@/server/errors'
import { body, json, options, route } from '@/server/http'
import { createSubscriptionCheckout } from '@/server/payments'

export const POST = route(async (request) => {
  const uid = await requireUserId(request)
  const { priceId } = await body<{ priceId?: string }>(request)
  if (!priceId) throw new ApiError('priceId required')
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.id, uid),
  })
  if (!user) throw new ApiError('user not found', 404)
  const session = await createSubscriptionCheckout(
    user,
    priceId,
    getServerEnv().APP_ORIGIN
  )
  return json({ checkoutUrl: session.url })
})
export const OPTIONS = options
