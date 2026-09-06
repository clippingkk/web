import { GraphQLError } from 'graphql'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { JWTPayload, JWTVerifyOptions, JWTVerifyResult } from 'jose'

import { gateConfig } from './config'

export interface GateIdentity {
  gateUserId: string
  email: string
  name: string
  image?: string
  emailVerified: boolean
}

/**
 * MODULE scope on purpose. `createRemoteJWKSet` keeps the fetched key set and
 * re-fetches when it sees an unknown `kid` — Gate rotates its ES256 signing key
 * every 30 days with a 30-day grace period, so a set rebuilt per request would
 * hammer the endpoint, and one cached on a fixed timer would start rejecting
 * perfectly valid tokens the moment a rotation lands.
 */
let rootJwks: ReturnType<typeof createRemoteJWKSet> | undefined

/**
 * Gate's OpenAPI document places the key set under the issuer
 * (`/api/auth/.well-known/jwks.json`) while the deployment serves it from the
 * origin root. Both are tried so a wrong guess degrades into one extra fetch
 * rather than into every login failing. The signature check is what actually
 * establishes trust, so reading the key set from either location is safe.
 */
let issuerJwks: ReturnType<typeof createRemoteJWKSet> | undefined

// Problems with retrieving or matching the key set — as opposed to a token that
// is genuinely bad, which no other key set would rescue.
const JWKS_LOOKUP_FAILURES = new Set([
  'ERR_JOSE_GENERIC', // non-200 or unparseable key set response
  'ERR_JWKS_INVALID',
  'ERR_JWKS_NO_MATCHING_KEY',
  'ERR_JWKS_MULTIPLE_MATCHING_KEYS',
  'ERR_JWKS_TIMEOUT',
])

function isJwksLookupFailure(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code
  return typeof code === 'string' && JWKS_LOOKUP_FAILURES.has(code)
}

async function verifySignature(
  idToken: string
): Promise<JWTVerifyResult<JWTPayload>> {
  const options: JWTVerifyOptions = {
    algorithms: ['ES256'],
    requiredClaims: ['exp', 'iat', 'sub', 'iss', 'aud'],
    issuer: gateConfig().issuer,
    audience: gateConfig().clientId,
    clockTolerance: 5,
  }

  try {
    return await jwtVerify(
      idToken,
      (rootJwks ??= createRemoteJWKSet(new URL(gateConfig().jwksUrl))),
      options
    )
  } catch (err) {
    if (!isJwksLookupFailure(err)) throw err
    return await jwtVerify(
      idToken,
      (issuerJwks ??= createRemoteJWKSet(
        new URL(`${gateConfig().issuer}/.well-known/jwks.json`)
      )),
      options
    )
  }
}

function claimString(payload: JWTPayload, key: string): string | undefined {
  const value = payload[key]
  return typeof value === 'string' && value ? value : undefined
}

function unauthorized(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 401 } })
}

/**
 * Verifies a Gate ID token and reduces it to the identity ClippingKK stores.
 * Rejects anything that is not ES256, not from Gate's issuer, not audienced at
 * our client, or not tied to the nonce we generated for this login attempt.
 */
export async function verifyIdToken(
  idToken: string,
  nonce: string
): Promise<GateIdentity> {
  let payload: JWTPayload
  try {
    ;({ payload } = await verifySignature(idToken))
  } catch (err) {
    throw unauthorized(
      err instanceof Error
        ? `invalid id token: ${err.message}`
        : 'invalid id token'
    )
  }

  // Binds the token to this browser's authorization request, which is what
  // stops a token replayed from another session from being accepted.
  if (!nonce || payload.nonce !== nonce) {
    throw unauthorized('id token nonce mismatch')
  }

  if (
    (payload.azp && payload.azp !== gateConfig().clientId) ||
    (Array.isArray(payload.aud) &&
      payload.aud.length > 1 &&
      payload.azp !== gateConfig().clientId)
  )
    throw unauthorized('id token authorized party mismatch')

  const gateUserId = payload.sub
  if (!gateUserId) {
    throw unauthorized('id token has no subject')
  }

  const email = claimString(payload, 'email')
  if (!email) {
    throw unauthorized('id token has no email')
  }

  return {
    gateUserId,
    email,
    name:
      claimString(payload, 'name') ??
      claimString(payload, 'preferred_username') ??
      email.split('@')[0],
    // `picture` is the OIDC standard claim; better-auth also emits `image`.
    image: claimString(payload, 'picture') ?? claimString(payload, 'image'),
    emailVerified: payload.email_verified === true,
  }
}
