import { and, eq, isNull } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { getDatabase } from '../db'
import { users } from '../db/schema'
import { ApiError } from '../errors'
import { cacheGet, cacheSet, cacheDelete, getRedis } from '../redis'
import { requireProductRead } from './authz'
import { randomToken, refreshTokens, revokeToken } from './oidc'
export { SESSION_COOKIE } from './security'
export const SESSION_TTL = 30 * 86400
export interface GateSession {
  id: string
  localUserId: number
  gateUserId: string
  accessToken: string
  refreshToken?: string
  accessTokenExpiresAt: number
  expiresAt: number
}
const key = (id: string) => `ck:gate:session:${id}`
export async function createSession(
  input: Omit<GateSession, 'id' | 'expiresAt'>
) {
  const session = {
    ...input,
    id: randomToken(),
    expiresAt: Date.now() + SESSION_TTL * 1000,
  }
  await cacheSet(key(session.id), session, SESSION_TTL)
  await (
    await getRedis()
  ).sAdd(`ck:gate:user-sessions:${session.localUserId}`, session.id)
  return session
}
export async function destroySession(id: string) {
  const session = await cacheGet<GateSession>(key(id))
  await cacheDelete(key(id))
  if (session)
    await (
      await getRedis()
    ).sRem(`ck:gate:user-sessions:${session.localUserId}`, id)
  if (session?.refreshToken)
    await revokeToken(session.refreshToken).catch(() => undefined)
}
export async function readSession(id: string): Promise<GateSession | null> {
  if (!id || !/^[\w-]{43}$/.test(id)) return null
  const session = await cacheGet<GateSession>(key(id))
  if (!session) return null
  const active = await getDatabase().db.query.users.findFirst({
    where: and(
      eq(users.id, session.localUserId),
      eq(users.gateUserId, session.gateUserId),
      isNull(users.deletedAt)
    ),
  })
  if (!active || session.expiresAt <= Date.now()) {
    await destroySession(id)
    return null
  }
  await requireProductRead(session.localUserId)
  if (session.accessTokenExpiresAt > Date.now() + 60000) return session
  const redis = await getRedis()
  const lockKey = `${key(id)}:refresh`
  const lock = randomToken()
  // The upstream request times out at 10s; the distributed lease lasts 20s.
  if (!(await redis.set(lockKey, lock, { NX: true, PX: 20000 }))) {
    for (let i = 0; i < 110; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (!(await redis.exists(lockKey))) return readSession(id)
    }
    throw new ApiError('Session refresh is busy. Retry shortly.', 503)
  }
  try {
    const current = await cacheGet<GateSession>(key(id))
    if (!current) return null
    if (current.accessTokenExpiresAt > Date.now() + 60000) return current
    if (!current.refreshToken) {
      await cacheDelete(key(id))
      return null
    }
    try {
      const tokens = await refreshTokens(current.refreshToken)
      const updated = {
        ...current,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? current.refreshToken,
        accessTokenExpiresAt: Date.now() + tokens.expiresIn * 1000,
      }
      // Logout/deletion must not be undone by an in-flight refresh.
      const ttl = Math.floor((current.expiresAt - Date.now()) / 1000)
      if (ttl <= 0) return null
      const written = await redis.set(key(id), JSON.stringify(updated), {
        XX: true,
        EX: ttl,
      })
      if (!written) {
        await revokeToken(updated.refreshToken!).catch(() => undefined)
        return null
      }
      return updated
    } catch (error) {
      if (
        error instanceof GraphQLError &&
        error.extensions.gateError === 'invalid_grant'
      ) {
        await cacheDelete(key(id))
        return null
      }
      throw new ApiError('Gate is temporarily unavailable. Retry shortly.', 503)
    }
  } finally {
    await redis.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0",
      { keys: [lockKey], arguments: [lock] }
    )
  }
}

export async function destroyUserSessions(userId: number) {
  const redis = await getRedis(),
    index = `ck:gate:user-sessions:${userId}`
  for (const id of await redis.sMembers(index)) await destroySession(id)
  await redis.del(index)
}
