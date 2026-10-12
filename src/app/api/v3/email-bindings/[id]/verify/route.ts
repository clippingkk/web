import { z } from 'zod'

import { body, noStore } from '@/app/api/auth/native/shared'
import { requireUserId } from '@/server/auth'
import { verifyEmailBinding } from '@/server/email-import/bindings'
import { ApiError } from '@/server/errors'
import { options, route } from '@/server/http'

const verifySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
})

type Context = { params: Promise<{ id: string }> }

export const POST = route(async (request, context) => {
  const userId = await requireUserId(request)
  const id = Number((await (context as Context).params).id)
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new ApiError('address not found', 404)
  const { code } = await body(request, verifySchema)
  return noStore(await verifyEmailBinding(userId, id, code))
}, 'email_import.bindings.verify')

export const OPTIONS = options
