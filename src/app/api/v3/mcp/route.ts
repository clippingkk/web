import { originValidationResponse } from '@modelcontextprotocol/server'

import { getServerEnv } from '@/server/env'
import { route, type RouteCors } from '@/server/http'
import { authenticateMcpRequest, mcpUserId } from '@/server/mcp/auth'
import { mcpHandler } from '@/server/mcp/server'
import { rateLimit } from '@/server/redis'

/**
 * The ClippingKK MCP server (Streamable HTTP, protocol 2026-07-28 with a
 * stateless fallback for 2025-era clients). Read-only tools over the caller's
 * own library; see docs/mcp.md.
 */

export const maxDuration = 60

/** Per reader, per minute: generous for an agent, a ceiling for a runaway loop. */
const RATE_LIMIT = 120

const cors: RouteCors = {
  allowHeaders: [
    'MCP-Protocol-Version',
    'Mcp-Method',
    'Mcp-Name',
    // Sent by 2025-era clients; ignored.
    'Mcp-Session-Id',
    'Last-Event-ID',
  ],
  exposeHeaders: ['WWW-Authenticate'],
}

const handler = route(
  async (request) => {
    // DNS-rebinding guard the transport spec requires. Server-side clients
    // send no Origin; browsers must come from an origin we already trust.
    const env = getServerEnv()
    const rejected = originValidationResponse(
      request,
      [env.APP_ORIGIN, ...env.corsAllowedOrigins].flatMap((origin) =>
        URL.canParse(origin) ? [new URL(origin).hostname] : []
      )
    )
    if (rejected) return rejected

    const authInfo = await authenticateMcpRequest(request)
    if (authInfo instanceof Response) return authInfo

    const { allowed } = await rateLimit(
      `ck:mcp:${mcpUserId(authInfo)}`,
      RATE_LIMIT,
      60
    )
    if (!allowed)
      return Response.json(
        { error: 'too_many_requests', error_description: 'Slow down.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )

    return mcpHandler.fetch(request, { authInfo })
  },
  'mcp.request',
  cors
)

export const GET = handler
export const POST = handler
export const DELETE = handler
export const OPTIONS = route(
  async () => new Response(null, { status: 204 }),
  'mcp.options',
  cors
)
