import { eq } from 'drizzle-orm'

import { requireUserId } from '@/server/auth'
import { getDatabase } from '@/server/db'
import { users } from '@/server/db/schema'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'
import { createPaymentSheet } from '@/server/payments'

export const POST = route(async (request) => {
  const uid = await requireUserId(request)
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.id, uid),
  })
  if (!user) throw new ApiError('user not found', 404)
  return json(await createPaymentSheet(user))
}, 'payment.sheet.create')
export const OPTIONS = options
