import { decode } from '@msgpack/msgpack'
import { createClient, RESP_TYPES } from 'redis'

import { getServerEnv } from './env'

type RedisState = {
  client: ReturnType<typeof createClient>
  connecting?: Promise<ReturnType<typeof createClient>>
}

const globalForRedis = globalThis as typeof globalThis & {
  clippingkkRedis?: RedisState
}

function state(): RedisState {
  if (!globalForRedis.clippingkkRedis) {
    const client = createClient({ url: getServerEnv().REDIS_URL })
    client.on('error', (error) => console.error('redis error', error))
    globalForRedis.clippingkkRedis = { client }
  }
  return globalForRedis.clippingkkRedis!
}

export async function getRedis() {
  const current = state()
  if (current.client.isReady) return current.client
  current.connecting ??= current.client.connect().then(() => current.client)
  return current.connecting
}

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  const value = await (
    await getRedis()
  )
    .withTypeMapping({ [RESP_TYPES.BLOB_STRING]: Buffer })
    .get(key)
  if (!value) return undefined
  try {
    return JSON.parse(value.toString('utf8')) as T
  } catch {
    try {
      return decode(value) as T
    } catch {
      return value.toString('utf8') as T
    }
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
) {
  const client = await getRedis()
  const payload = JSON.stringify(value)
  if (ttlSeconds) await client.set(key, payload, { EX: ttlSeconds })
  else await client.set(key, payload)
}

export async function cacheDelete(...keys: string[]) {
  if (keys.length === 0) return
  await (await getRedis()).del(keys)
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
) {
  const client = await getRedis()
  const count = await client.eval(
    `local n = redis.call('INCR', KEYS[1])
     if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
     return n`,
    { keys: [key], arguments: [String(windowSeconds)] }
  )
  return { allowed: Number(count) <= limit, count: Number(count) }
}

export async function withRedisLock<T>(
  key: string,
  ttlMs: number,
  operation: () => Promise<T>
): Promise<T> {
  const client = await getRedis()
  const token = crypto.randomUUID()
  const acquired = await client.set(key, token, { NX: true, PX: ttlMs })
  if (!acquired) throw new Error('resource is locked')
  try {
    return await operation()
  } finally {
    await client.eval(
      `if redis.call('GET', KEYS[1]) == ARGV[1] then
         return redis.call('DEL', KEYS[1])
       end
       return 0`,
      { keys: [key], arguments: [token] }
    )
  }
}

export async function isRedisReady() {
  try {
    return (await (await getRedis()).ping()) === 'PONG'
  } catch {
    return false
  }
}

export async function closeRedis() {
  const current = globalForRedis.clippingkkRedis
  if (!current) return
  if (current.client.isOpen) await current.client.quit()
  delete globalForRedis.clippingkkRedis
}
