import { z } from 'zod'

import { body, noStore } from '@/app/api/auth/native/shared'
import { requireUserId } from '@/server/auth'
import { options, route } from '@/server/http'
import {
  createMcpToken,
  listMcpTokens,
  TOKEN_TTL_DAYS,
} from '@/server/mcp/tokens'

/**
 * MCP personal access tokens, managed from Settings → MCP. Cookie session only:
 * an MCP token itself is not accepted here, so a leaked one cannot mint more.
 */

const createSchema = z.object({
  name: z.string().trim().min(1).max(64),
  ttlDays: z
    .union(TOKEN_TTL_DAYS.map((days) => z.literal(days)))
    .nullable()
    .default(null),
})

export const GET = route(async (request) => {
  const userId = await requireUserId(request)
  return noStore(await listMcpTokens(userId))
}, 'mcp.tokens.list')

export const POST = route(async (request) => {
  const userId = await requireUserId(request)
  const { name, ttlDays } = await body(request, createSchema)
  return noStore(await createMcpToken(userId, name, ttlDays), 201)
}, 'mcp.tokens.create')

export const OPTIONS = options
