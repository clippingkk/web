import { isDatabaseReady } from '@/server/db'
import { isRedisReady } from '@/server/redis'

export async function GET() {
  const [database, redis] = await Promise.all([
    isDatabaseReady(),
    isRedisReady(),
  ])
  if (!database || !redis)
    return Response.json({ database, redis }, { status: 503 })
  return new Response(null, { status: 204 })
}
