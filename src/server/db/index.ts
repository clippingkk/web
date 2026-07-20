import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { getServerEnv } from '../env'
import * as schema from './schema'

type DbState = {
  pool: Pool
  db: ReturnType<typeof drizzle<typeof schema>>
}

const globalForDb = globalThis as typeof globalThis & {
  clippingkkDb?: DbState
}

export function getDatabase(): DbState {
  if (globalForDb.clippingkkDb) return globalForDb.clippingkkDb

  const env = getServerEnv()
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: Number.parseInt(process.env.DATABASE_POOL_MAX ?? '10', 10),
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  })
  const db = drizzle(pool, { schema })
  globalForDb.clippingkkDb = { pool, db }
  return globalForDb.clippingkkDb
}

export async function isDatabaseReady() {
  try {
    const result = await getDatabase().pool.query('select 1 as ready')
    return result.rows[0]?.ready === 1
  } catch {
    return false
  }
}

export async function closeDatabase() {
  if (!globalForDb.clippingkkDb) return
  await globalForDb.clippingkkDb.pool.end()
  delete globalForDb.clippingkkDb
}
