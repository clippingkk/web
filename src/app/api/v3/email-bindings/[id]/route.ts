import { requireUserId } from '@/server/auth'
import { removeEmailBinding } from '@/server/email-import/bindings'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'

type Context = { params: Promise<{ id: string }> }

export const DELETE = route(async (request, context) => {
  const userId = await requireUserId(request)
  const id = Number((await (context as Context).params).id)
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new ApiError('address not found', 404)
  await removeEmailBinding(userId, id)
  return json(null)
}, 'email_import.bindings.remove')

export const OPTIONS = options
