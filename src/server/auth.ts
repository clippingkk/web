import { createDecipheriv, createHash } from 'node:crypto'

import { and, eq, isNull } from 'drizzle-orm'
import { jwtVerify, SignJWT } from 'jose'

import { getDatabase } from './db'
import { users } from './db/schema'
import { getServerEnv } from './env'
import { ApiError } from './errors'
import { cookieValue, assertSameOrigin } from './gate/security'
import { readSession } from './gate/session'
import { decodeLegacyValue, encodeLegacyValue } from './legacy-crypto'

export { decodeLegacyValue, encodeLegacyValue } from './legacy-crypto'

const encoder = new TextEncoder()

export function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

function jwtKey() {
  return encoder.encode(getServerEnv().JWT_SECRET)
}

export async function issueToken(userId: number, expiresAt?: Date) {
  requireLegacyAuth()
  const expiration =
    expiresAt ?? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  return new SignJWT({ id: String(userId) })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(`ck-server@${getServerEnv().GIT_COMMIT}`)
    .setExpirationTime(Math.floor(expiration.getTime() / 1000))
    .sign(jwtKey())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, jwtKey(), {
    algorithms: ['HS256'],
  })
  const id = Number.parseInt(String(payload.id), 10)
  if (!Number.isFinite(id) || id <= 0)
    throw new ApiError('invalid token', 401, 'UNAUTHORIZED')
  return id
}

function repeatedKey(text: string, length: 16 | 32) {
  let result = ''
  while (result.length <= length) result += `|||${text}`
  return Buffer.from(result.slice(0, length))
}

function decryptCfb(key: Buffer, payload: Buffer, embeddedIv: boolean) {
  if (payload.length < 16)
    throw new ApiError('ciphertext too short', 401, 'UNAUTHORIZED')
  const env = getServerEnv()
  const iv = embeddedIv
    ? payload.subarray(0, 16)
    : Buffer.from(env.X_BASIC_AES_IV).subarray(0, 16)
  const content = embeddedIv ? payload.subarray(16) : payload
  const decipher = createDecipheriv(`aes-${key.length * 8}-cfb`, key, iv)
  return Buffer.concat([decipher.update(content), decipher.final()])
}

export async function decodeCliToken(value: string) {
  return decodeLegacyValue(value)
}

export async function encodeCliToken(token: string) {
  return encodeLegacyValue(token)
}

async function userFromXBasic(value: string) {
  const key = repeatedKey(getServerEnv().X_BASIC_AES_KEY, 16)
  const payload = decryptCfb(key, Buffer.from(value, 'hex'), false)
  const parsed = JSON.parse(
    payload.toString('utf8').replaceAll(String.fromCharCode(14), '').trimEnd()
  ) as {
    id: number
    createdAt: number
  }
  if (new Date(parsed.createdAt).getTime() + 5 * 60 * 1000 < Date.now()) {
    throw new ApiError('expired', 403, 'FORBIDDEN')
  }
  return parsed.id
}

export function requireLegacyAuth() {
  if (getServerEnv().LEGACY_AUTH_ENABLED !== '1')
    throw new ApiError('Sign in through Gate.', 410, 'LEGACY_AUTH_DISABLED')
}
export async function optionalUserId(request: Request) {
  const sessionId = cookieValue(request)
  if (sessionId) {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method))
      assertSameOrigin(request)
    const session = await readSession(sessionId)
    if (!session) throw new ApiError('Sign in again', 401, 'UNAUTHORIZED')
    return session.localUserId
  }
  const id = await legacyUserId(request)
  if (!id) return 0
  const user = await getDatabase().db.query.users.findFirst({
    where: and(eq(users.id, id), isNull(users.deletedAt)),
  })
  if (!user) throw new ApiError('Sign in again', 401, 'UNAUTHORIZED')
  if (user.gateUserId)
    await (await import('./gate/authz')).requireProductRead(id)
  return id
}
async function legacyUserId(request: Request) {
  if (request.headers.has('authorization') || request.headers.has('x-basic'))
    requireLegacyAuth()

  const basic = request.headers.get('x-basic')
  if (basic) return userFromXBasic(basic)

  const authorization = request.headers.get('authorization')?.trim()
  if (!authorization) return 0
  const space = authorization.indexOf(' ')
  if (space < 1) throw new ApiError('unauthorized', 401, 'UNAUTHORIZED')
  const scheme = authorization.slice(0, space)
  let token = authorization.slice(space + 1)
  if (scheme === 'X-CLI') token = await decodeCliToken(token)
  if (scheme !== 'Bearer' && scheme !== 'X-CLI') {
    throw new ApiError('unauthorized', 401, 'UNAUTHORIZED')
  }
  try {
    return await verifyToken(token)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('invalid token', 401, 'UNAUTHORIZED')
  }
}

export async function requireUserId(request: Request) {
  const id = await optionalUserId(request)
  if (!id) throw new ApiError('unauthorized', 401, 'UNAUTHORIZED')
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
    new URL(request.url).pathname !== '/api/auth/delete-account'
  )
    await (await import('./gate/authz')).requireProductWrite(id)
  return id
}
