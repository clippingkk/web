import process from 'node:process'

import pg from 'pg'
import { createClient } from 'redis'

const databaseUrl = process.env.DATABASE_URL
const redisUrl = process.env.REDIS_URL
const queueRedisUrl = process.env.QUEUE_REDIS_URL ?? redisUrl

if (!databaseUrl || !redisUrl) {
  throw new Error('DATABASE_URL and REDIS_URL are required')
}

const requiredColumns = {
  clippings: [
    'id',
    'title',
    'content',
    'book_id',
    'data_id',
    'created_by',
    'nouns',
    'source',
  ],
  comments: ['id', 'belongs_to', 'created_by', 'content', 'enabled'],
  devices: ['id', 'device_id', 'ios_device_token', 'user_id'],
  external_accounts: ['id', 'user_id', 'wechat_openid', 'apple_unique'],
  nouns: ['id', 'noun', 'updaters', 'scope', 'user_nouns'],
  orders: ['id', 'order_id', 'subscription_id', 'user_orders'],
  users: [
    'id',
    'email',
    'pwd',
    'checked',
    'stripe_customer_id',
    'premium_end_at',
  ],
  web3_addresses: ['id', 'address', 'user_address'],
  web_hook_records: ['id', 'request_url', 'web_hook_records'],
  web_hooks: ['id', 'owner', 'step', 'hook_url'],
}

const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 })
try {
  const result = await pool.query(
    `select table_name, column_name
       from information_schema.columns
      where table_schema = 'public'
        and table_name = any($1::text[])`,
    [Object.keys(requiredColumns)]
  )
  const actual = Map.groupBy(result.rows, (row) => row.table_name)
  const missing = []
  for (const [table, columns] of Object.entries(requiredColumns)) {
    const present = new Set(
      (actual.get(table) ?? []).map((row) => row.column_name)
    )
    for (const column of columns)
      if (!present.has(column)) missing.push(`${table}.${column}`)
  }
  if (missing.length)
    throw new Error(
      `Database is missing required columns: ${missing.join(', ')}`
    )

  const invariants = await pool.query(`
    select
      (select count(*) from users) as users,
      (select count(*) from clippings) as clippings,
      (select count(*) from comments) as comments,
      (select count(*) from orders) as orders
  `)
  console.log('PostgreSQL OK', invariants.rows[0])
} finally {
  await pool.end()
}

for (const [name, url] of [
  ['cache', redisUrl],
  ['queue', queueRedisUrl],
]) {
  const client = createClient({ url })
  try {
    await client.connect()
    const [pong, size] = await Promise.all([client.ping(), client.dbSize()])
    console.log(`Redis ${name} OK`, {
      pong,
      keys: size,
      db: new URL(url).pathname.slice(1) || '0',
    })
  } finally {
    if (client.isOpen) await client.quit()
  }
}
