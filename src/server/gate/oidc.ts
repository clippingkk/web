import { createHash, randomBytes } from 'node:crypto'

import { GraphQLError } from 'graphql'

import { gateConfig } from './config'

export interface GateTokens {
  accessToken: string
  expiresIn: number
  refreshToken?: string
  idToken: string
  scope: string
}

/** Cryptographically random, URL-safe, and cookie-safe. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/** PKCE S256: the challenge is base64url(SHA-256(verifier)). */
export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = randomToken(32)
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function buildAuthorizationUrl(p: {
  state: string
  nonce: string
  challenge: string
}): string {
  // An unset GATE_CLIENT_ID defaults to '' (see config.ts) so a missing value fails
  // the request rather than the boot. Gate answers the empty client_id with a redirect
  // to `invalid_client: client_id is required` — the same message it gives for a client
  // it has never heard of, which points nowhere near the real cause. Name it here.
  if (!gateConfig().clientId) {
    throw new Error(
      'GATE_CLIENT_ID is not set — register an OIDC client in the Gate dashboard ' +
        'and add it to .env.local. See docs/gate-provisioning.md.'
    )
  }

  const url = new URL(`${gateConfig().issuer}/oauth2/authorize`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', gateConfig().clientId)
  url.searchParams.set('redirect_uri', gateConfig().redirectUri)
  url.searchParams.set('scope', gateConfig().scopes)
  url.searchParams.set('state', p.state)
  url.searchParams.set('nonce', p.nonce)
  url.searchParams.set('code_challenge', p.challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

export function buildEndSessionUrl(p: {
  idToken?: string
  postLogoutRedirectUri: string
}): string {
  const url = new URL(`${gateConfig().issuer}/oauth2/end-session`)
  url.searchParams.set('client_id', gateConfig().clientId)
  url.searchParams.set('post_logout_redirect_uri', p.postLogoutRedirectUri)
  if (p.idToken) {
    url.searchParams.set('id_token_hint', p.idToken)
  }
  return url.toString()
}

interface TokenResponseBody {
  access_token?: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
  id_token?: string
  scope?: string
  error?: string
  error_description?: string
}

/**
 * `POST /api/auth/oauth2/*` needs HTTP Basic plus a form-encoded body, even
 * though the OpenAPI document advertises `application/json` and the generated
 * SDK would therefore send JSON. This is the documented spec/reality mismatch,
 * and the reason these three calls are hand-written instead of going through
 * `gateClient`.
 *
 * The credentials go into Basic verbatim rather than percent-encoded first:
 * that is what Gate decodes, and Gate's own ids and secrets contain no
 * characters that would differ either way.
 */
async function tokenEndpoint(
  path: string,
  form: Record<string, string>
): Promise<TokenResponseBody> {
  const credentials = Buffer.from(
    `${gateConfig().clientId}:${gateConfig().clientSecret}`
  ).toString('base64')

  let response: Response
  try {
    response = await fetch(`${gateConfig().issuer}${path}`, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(form).toString(),
    })
  } catch (err) {
    throw new GraphQLError(
      err instanceof Error ? err.message : 'Gate token request failed',
      {
        extensions: { code: 502 },
      }
    )
  }

  const text = await response.text()
  let body: TokenResponseBody = {}
  try {
    body = text ? (JSON.parse(text) as TokenResponseBody) : {}
  } catch {
    // A non-JSON body is only ever an error page; the status below reports it.
  }

  if (!response.ok || body.error) {
    const status =
      response.status >= 400 && response.status <= 599 ? response.status : 502
    const message =
      body.error_description ||
      body.error ||
      `Gate token request failed (${response.status})`
    throw new GraphQLError(message, {
      extensions: { code: status, gateError: body.error },
    })
  }

  return body
}

function toTokens(body: TokenResponseBody): GateTokens {
  if (!body.access_token) {
    throw new GraphQLError('Gate returned no access token', {
      extensions: { code: 502 },
    })
  }
  return {
    accessToken: body.access_token,
    expiresIn: body.expires_in ?? 600,
    refreshToken: body.refresh_token,
    // A refresh_token grant does not have to re-issue an ID token; the caller
    // keeps the one it already has.
    idToken: body.id_token ?? '',
    scope: body.scope ?? gateConfig().scopes,
  }
}

export async function exchangeCode(p: {
  code: string
  verifier: string
}): Promise<GateTokens> {
  return toTokens(
    await tokenEndpoint('/oauth2/token', {
      grant_type: 'authorization_code',
      code: p.code,
      code_verifier: p.verifier,
      redirect_uri: gateConfig().redirectUri,
      client_id: gateConfig().clientId,
      // Asks Gate for a JWT access token audienced at ClippingKK rather than an
      // opaque one.
      resource: gateConfig().resource,
    })
  )
}

export async function refreshTokens(refreshToken: string): Promise<GateTokens> {
  return toTokens(
    await tokenEndpoint('/oauth2/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: gateConfig().clientId,
      resource: gateConfig().resource,
    })
  )
}

/** Throws if Gate rejects the revocation; logout paths should treat that as non-fatal. */
export async function revokeToken(token: string): Promise<void> {
  await tokenEndpoint('/oauth2/revoke', {
    token,
    client_id: gateConfig().clientId,
  })
}
