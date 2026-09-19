import { createHash, timingSafeEqual } from 'node:crypto'

import { and, eq, isNull } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { getDatabase } from '../db'
import { users } from '../db/schema'
import { ApiError } from '../errors'
import { getRedis } from '../redis'
import { gateConfig } from './config'
import {
  buildNativeAuthorizationUrl,
  exchangeNativeCode,
  randomToken,
  revokeToken,
} from './oidc'
import { createSession, destroySession, readSession } from './session'
import { ensureLocalUser, provisionMember } from './user'
import { verifyIdToken } from './verify'

/**
 * Sign-in for the iOS app. The device runs PKCE and the browser sheet; this
 * server is the OAuth client. Gate's tokens never leave it — the app holds an
 * opaque credential that names a Redis session, so the widget, which cannot
 * refresh anything, keeps working while `readSession` refreshes behind it.
 */
export const NATIVE_PREFIX = 'ck_ios_'
const NATIVE_TOKEN = /^ck_ios_[A-Za-z0-9_-]{43}$/
const TRANSACTION_TTL = 600

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('base64url')
const transactionKey = (id: string) => `ck:native:tx:${sha256(id)}`
/** Only the digest reaches Redis, so a dump of it holds no usable credential. */
const sessionId = (token: string) => sha256(token)

interface Transaction {
  state: string
  nonce: string
  challenge: string
  clientId: string
}

const unauthorized = () => new ApiError('Sign in again', 401, 'UNAUTHORIZED')

function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/**
 * The native credential on a request, or null when the caller is not a native
 * client. Anything carrying the prefix is claimed here, well-formed or not, so
 * it is answered with 401 instead of falling through to the legacy checks.
 */
export function nativeCredential(request: Request): string | null {
  const match = /^Bearer\s+(.+)$/i.exec(
    request.headers.get('authorization')?.trim() ?? ''
  )
  return match?.[1].startsWith(NATIVE_PREFIX) ? match[1] : null
}

export async function startNative(challenge: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(challenge))
    throw new ApiError('Invalid PKCE challenge.', 400)
  const clientId = gateConfig().nativeClientId
  if (!clientId) throw new ApiError('Native sign-in is not configured.', 503)
  const transactionId = randomToken()
  const tx: Transaction = {
    state: randomToken(),
    nonce: randomToken(),
    challenge,
    clientId,
  }
  await (
    await getRedis()
  ).set(transactionKey(transactionId), JSON.stringify(tx), {
    EX: TRANSACTION_TTL,
  })
  return {
    transactionId,
    state: tx.state,
    authorizationUrl: buildNativeAuthorizationUrl(tx),
  }
}

export async function exchangeNative(input: {
  transactionId: string
  code: string
  state: string
  verifier: string
}) {
  const redis = await getRedis()
  const key = transactionKey(input.transactionId)
  const raw = await redis.get(key)
  if (!raw) throw new ApiError('Sign-in expired. Please start again.', 400)
  const tx = JSON.parse(raw) as Transaction
  if (
    !equal(tx.state, input.state) ||
    !equal(tx.challenge, sha256(input.verifier))
  )
    throw new ApiError('Invalid sign-in response.', 400)
  // Check the binding first, then consume: a forged callback cannot burn the
  // attempt, and exactly one exchange ever reaches Gate.
  const claimed = await redis.eval(
    "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0",
    { keys: [key], arguments: [raw] }
  )
  if (Number(claimed) !== 1)
    throw new ApiError('Sign-in was already used.', 400)

  let refreshToken: string | undefined
  try {
    const tokens = await exchangeNativeCode({
      code: input.code,
      verifier: input.verifier,
      clientId: tx.clientId,
    })
    refreshToken = tokens.refreshToken
    // Without one the session would die with the ten-minute access token. It
    // means the client was registered without `offline_access`, which Gate
    // cannot add afterwards.
    if (!refreshToken)
      throw new ApiError(
        'Native sign-in is misconfigured: Gate issued no refresh token.',
        503
      )
    const identity = await verifyIdToken(tokens.idToken, tx.nonce, tx.clientId)
    const user = await ensureLocalUser(identity)
    await provisionMember(user.id)
    const token = NATIVE_PREFIX + randomToken()
    const session = await createSession(
      {
        localUserId: user.id,
        gateUserId: identity.gateUserId,
        accessToken: tokens.accessToken,
        refreshToken,
        accessTokenExpiresAt: Date.now() + tokens.expiresIn * 1000,
        kind: 'native',
        clientId: tx.clientId,
      },
      sessionId(token)
    )
    return { token, expiresAt: session.expiresAt, user: profile(user) }
  } catch (error) {
    if (refreshToken)
      await revokeToken(refreshToken, tx.clientId).catch(() => undefined)
    throw publicError(error)
  }
}

/**
 * The oidc helpers throw GraphQLError carrying Gate's own wording. A route
 * would echo that verbatim, so reduce it to what a client may be told.
 */
function publicError(error: unknown) {
  if (error instanceof ApiError) return error
  if (error instanceof GraphQLError) {
    if (error.extensions.gateError === 'invalid_grant')
      return new ApiError('Sign-in expired. Please start again.', 400)
    // Only the ID-token checks throw a bare 401. One that carries `gateError`
    // is Gate rejecting our client, which is ours to fix, not the user's.
    if (error.extensions.code === 401 && !error.extensions.gateError)
      return new ApiError('Sign-in could not be verified.', 401, 'UNAUTHORIZED')
  }
  return new ApiError('Gate is temporarily unavailable. Retry shortly.', 503)
}

export function profile(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  }
}

/** Null means "sign in again"; a thrown 503 means "keep the credential and retry". */
export async function readNativeSession(token: string) {
  if (!NATIVE_TOKEN.test(token)) return null
  return readSession(sessionId(token), 'native')
}

export async function nativeUser(token: string) {
  const session = await readNativeSession(token)
  if (!session) throw unauthorized()
  const user = await getDatabase().db.query.users.findFirst({
    where: and(eq(users.id, session.localUserId), isNull(users.deletedAt)),
  })
  if (!user) throw unauthorized()
  return user
}

/** Never reads or refreshes, so it still works for a deleted user or while Gate is down. */
export async function destroyNativeSession(token: string) {
  if (NATIVE_TOKEN.test(token)) await destroySession(sessionId(token))
}
