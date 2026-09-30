import {
  bearerAuthChallengeResponse,
  OAuthError,
  OAuthErrorCode,
  verifyBearerToken,
  type AuthInfo,
  type OAuthTokenVerifier,
} from '@modelcontextprotocol/server'
import { and, eq, isNull } from 'drizzle-orm'

import { getDatabase } from '../db'
import { users } from '../db/schema'
import { ApiError } from '../errors'
import { requireProductRead } from '../gate/authz'
import { gateConfig } from '../gate/config'
import { verifyGateAccessToken } from '../gate/verify'
import { isMcpToken, resolveMcpToken } from './tokens'

/**
 * ClippingKK as an OAuth resource server for MCP clients. Two credentials are
 * accepted on `Authorization: Bearer`:
 *
 * - `ck_mcp_…` personal access tokens from Settings → MCP, for clients that
 *   take a static header;
 * - Gate JWT access tokens audienced at `GATE_RESOURCE`, which MCP clients
 *   obtain through the OAuth flow advertised by the protected resource
 *   metadata document.
 */

/** RFC 9728 metadata for the resource `GATE_RESOURCE` (an origin, so no path). */
export function resourceMetadataUrl() {
  return `${gateConfig().appOrigin}/.well-known/oauth-protected-resource`
}

const invalidToken = (message: string) =>
  new OAuthError(OAuthErrorCode.InvalidToken, message)

async function userIdForGateSubject(gateUserId: string) {
  const user = await getDatabase().db.query.users.findFirst({
    columns: { id: true },
    where: and(eq(users.gateUserId, gateUserId), isNull(users.deletedAt)),
  })
  // Not a token problem, so no 401: a new challenge would send the client
  // through the same sign-in and back here again.
  if (!user)
    throw new ApiError(
      'No ClippingKK account is linked to this sign-in yet. Sign in to ClippingKK once, then reconnect.',
      403,
      'ACCOUNT_NOT_LINKED'
    )
  return user.id
}

export const mcpTokenVerifier: OAuthTokenVerifier = {
  async verifyAccessToken(token) {
    let info: AuthInfo
    if (isMcpToken(token)) {
      const found = await resolveMcpToken(token)
      if (!found) throw invalidToken('Unknown, revoked or expired token')
      info = {
        token,
        clientId: `ck-pat:${found.tokenId}`,
        scopes: [],
        // Tokens without an expiry are checked on every request anyway; the
        // SDK only insists that the field is present.
        expiresAt: Math.floor(
          (found.expiresAt?.getTime() ?? Date.now() + 3600_000) / 1000
        ),
        extra: { userId: found.userId },
      }
    } else {
      let access
      try {
        access = await verifyGateAccessToken(token)
      } catch (err) {
        throw invalidToken(
          err instanceof Error ? err.message : 'Invalid access token'
        )
      }
      info = {
        token,
        clientId: access.clientId,
        scopes: access.scopes,
        expiresAt: access.expiresAt,
        extra: { userId: await userIdForGateSubject(access.gateUserId) },
      }
    }
    await requireProductRead(mcpUserId(info))
    return info
  },
}

export function mcpUserId(authInfo: AuthInfo | undefined) {
  const userId = authInfo?.extra?.userId
  if (typeof userId !== 'number' || !userId)
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  return userId
}

/**
 * The verified caller of an MCP request, or the response refusing it: a 401
 * with a `WWW-Authenticate` challenge naming the metadata document, or a JSON
 * error for account and product-access problems.
 */
export async function authenticateMcpRequest(
  request: Request
): Promise<AuthInfo | Response> {
  const options = {
    verifier: mcpTokenVerifier,
    resourceMetadataUrl: resourceMetadataUrl(),
  }
  try {
    return await verifyBearerToken(
      request.headers.get('authorization'),
      options
    )
  } catch (err) {
    if (err instanceof ApiError)
      return Response.json(
        { error: err.code.toLowerCase(), error_description: err.message },
        { status: err.status }
      )
    return bearerAuthChallengeResponse(err, options)
  }
}
