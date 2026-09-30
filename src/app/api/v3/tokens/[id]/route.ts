import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'
import { revokeMcpToken } from '@/server/mcp/tokens'

export const DELETE = route(async (request) => {
  const userId = await requireUserId(request)
  const id = Number(new URL(request.url).pathname.split('/').at(-1))
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new ApiError('token not found', 404)
  await revokeMcpToken(userId, id)
  return json(null)
}, 'mcp.tokens.revoke')

export const OPTIONS = options
