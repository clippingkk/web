// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'

import { afterAll, beforeAll, expect, it } from 'vitest'

import { expectedTableColumns } from '../expected-schema'
import { checkDatabaseSchema } from '../schema-check'

const storage = await (async () => {
  const { PGlite } = await import('@electric-sql/pglite')
  return { pg: new PGlite() }
})()

const query = (text: string, params: string[][]) =>
  storage.pg.query(text, params) as Promise<{
    rows: { table_name: string; column_name: string }[]
  }>

beforeAll(async () => {
  for (const name of (await readdir('drizzle'))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    await storage.pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
}, 30000)

afterAll(async () => storage.pg.close())

it('accepts a database built from the migrations', async () => {
  await expect(checkDatabaseSchema(query)).resolves.toEqual({ status: 'ok' })
})

it('names the column that is missing', async () => {
  // The production incident: 5.18.0 shipped against a database where 0002 had never run.
  await storage.pg.exec('ALTER TABLE users DROP COLUMN gate_user_id')
  try {
    await expect(checkDatabaseSchema(query)).resolves.toEqual({
      status: 'drift',
      missing: ['users.gate_user_id'],
    })
  } finally {
    await storage.pg.exec(
      'ALTER TABLE users ADD COLUMN gate_user_id varchar(255)'
    )
  }
})

it('reports a whole missing table once rather than every column', async () => {
  await storage.pg.exec('ALTER TABLE account_recovery_audit RENAME TO parked')
  try {
    const result = await checkDatabaseSchema(query)
    expect(result).toEqual({
      status: 'drift',
      missing: ['account_recovery_audit (table missing)'],
    })
  } finally {
    await storage.pg.exec('ALTER TABLE parked RENAME TO account_recovery_audit')
  }
})

it('stays unknown when the database cannot be reached, and does not throw', async () => {
  const failing = () => Promise.reject(new Error('ECONNREFUSED'))
  await expect(checkDatabaseSchema(failing)).resolves.toEqual({
    status: 'unknown',
    reason: 'ECONNREFUSED',
  })
})

it('stays unknown when the query outlives its deadline', async () => {
  const hanging = () => new Promise<never>(() => {})
  const result = await checkDatabaseSchema(hanging, 10)
  expect(result.status).toBe('unknown')
})

it('matches the latest drizzle snapshot, so schema.ts cannot drift from the migrations', async () => {
  const journal = JSON.parse(
    await readFile('drizzle/meta/_journal.json', 'utf8')
  ) as { entries: { idx: number }[] }
  // Snapshots are named by journal index, not by tag.
  const idx = String(journal.entries.at(-1)!.idx).padStart(4, '0')
  const snapshot = JSON.parse(
    await readFile(`drizzle/meta/${idx}_snapshot.json`, 'utf8')
  ) as {
    tables: Record<string, { name: string; columns: Record<string, unknown> }>
  }

  const fromSnapshot = Object.values(snapshot.tables)
    .map(
      (table) => `${table.name}: ${Object.keys(table.columns).sort().join(',')}`
    )
    .sort()
  const fromSchema = [...expectedTableColumns()]
    .map(([name, columns]) => `${name}: ${[...columns].sort().join(',')}`)
    .sort()

  expect(fromSchema).toEqual(fromSnapshot)
})
