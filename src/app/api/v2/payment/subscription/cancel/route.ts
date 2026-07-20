import { and, eq } from 'drizzle-orm'

import { requireUserId } from '@/server/auth'
import { getDatabase } from '@/server/db'
import { orders } from '@/server/db/schema'
import { ApiError } from '@/server/errors'
import { body, json, options, route } from '@/server/http'
import { getStripe } from '@/server/integrations'

export const DELETE = route(async (request) => {
  const uid = await requireUserId(request)
  const { subscriptionId } = await body<{ subscriptionId?: string }>(request)
  if (!subscriptionId) throw new ApiError('subscriptionId required')
  const order = await getDatabase().db.query.orders.findFirst({
    where: and(
      eq(orders.subscriptionId, subscriptionId),
      eq(orders.userOrders, uid)
    ),
  })
  if (!order) throw new ApiError('subscription may not belongs to you', 403)
  return json(await getStripe().subscriptions.cancel(subscriptionId))
})
export const OPTIONS = options
