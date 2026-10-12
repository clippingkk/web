import { requireUserId } from '@/server/auth'
import { removeEmailBinding } from '@/server/email-import/bindings'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'

export const DELETE = route(async (request) => {
  const userId = await requireUserId(request)
  const id = Number(new URL(request.url).pathname.split('/').at(-1))
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new ApiError('address not found', 404)
  await removeEmailBinding(userId, id)
  return json(null)
}, 'email_import.bindings.remove')

export const OPTIONS = options
