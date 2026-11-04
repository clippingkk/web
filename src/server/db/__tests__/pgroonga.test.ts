// @vitest-environment node
import { randomBytes } from 'node:crypto'

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool, type PoolClient } from 'pg'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

// No imports inside vi.hoisted: a dynamic import racing the static ones can
// drain Vitest's pending-mock queue first, so `../index` loads unmocked.
const getDatabaseMock = vi.hoisted(() => vi.fn())
vi.mock('../index', () => ({ getDatabase: getDatabaseMock }))

import type { GraphQLContext } from '../../graphql/context'
import { resolvers } from '../../graphql/resolvers'
import { searchClippings } from '../../mcp/queries'
import * as schema from '../schema'
import { clippingMatches, userMatches } from '../search'

/**
 * Search against real PGroonga, which PGlite cannot load. Needs a server running
 * the production image, ghcr.io/rawback-app/db, and a role that may create
 * databases and extensions:
 *
 *   TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
 *
 * Each run migrates a throwaway database with `drizzle/` exactly as
 * `pnpm db:migrate` does, so it also proves that migration 0008 creates the
 * extension and that search.ts still matches the indexes' expressions.
 */
const url = process.env.TEST_DATABASE_URL

const OWNER = 1
const OTHER = 2
const as = (userId: number) => ({ userId }) as GraphQLContext

type Db = NodePgDatabase<typeof schema>

describe.skipIf(!url)('PGroonga search', () => {
  const name = `clippingkk_test_${randomBytes(6).toString('hex')}`
  let admin: Pool
  let pool: Pool
  let db: Db

  beforeAll(async () => {
    admin = new Pool({ connectionString: url, max: 1 })
    await admin.query(`CREATE DATABASE ${name}`)
    const target = new URL(url!)
    target.pathname = `/${name}`
    pool = new Pool({ connectionString: target.toString(), max: 2 })
    db = drizzle(pool, { schema })
    await migrate(db, { migrationsFolder: 'drizzle' })
    getDatabaseMock.mockReturnValue({ db, pool })

    await db.insert(schema.users).values(
      [
        { id: OWNER, name: 'Owner', domain: 'owner', email: 'o@example.com' },
        { id: OTHER, name: '张三', domain: 'zhangsan', email: 'z@example.com' },
      ].map((user) => ({ ...user, pwd: '', checked: true }))
    )
    const rows: [string, string, number, boolean][] = [
      // title, content, creator, visible
      [
        '百年孤独',
        '多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。',
        OTHER,
        true,
      ],
      [
        'ノルウェイの森',
        '死は生の対極としてではなく、その一部として存在している。',
        OTHER,
        true,
      ],
      ['채식주의자', '나는 이제 동물이 아니야, 언니.', OTHER, true],
      [
        'The Old Man and the Sea',
        'But man is not made for defeat. A man can be destroyed but not defeated.',
        OTHER,
        true,
      ],
      ['Symbols', '100% sure', OTHER, true],
      ['Symbols', 'snake_case', OTHER, true],
      ['Private', 'a private whale', OTHER, false],
      ['Mine', 'my own private whale', OWNER, false],
    ]
    await db.insert(schema.clippings).values(
      rows.map(([title, content, createdBy, visible], index) => ({
        title,
        content,
        createdBy,
        visible,
        dataId: `pgroonga-${index}`,
      }))
    )
  }, 60_000)

  afterAll(async () => {
    await pool?.end()
    await admin?.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`)
    await admin?.end()
  })

  async function community(query: string) {
    const result = await resolvers.Query.search({}, { query }, as(0))
    return {
      clippings: result.clippings.map((row: schema.Clipping) => row.content),
      users: result.users.map((row: schema.User) => row.domain),
    }
  }
  const found = async (query: string) => (await community(query)).clippings

  // The tables are tiny, so the planner needs a push either way.
  const INDEX = ['SET enable_seqscan = off']
  const NO_INDEX = ['SET enable_indexscan = off', 'SET enable_bitmapscan = off']

  /** Runs `work` on one connection with `settings`, then resets it for the pool. */
  async function under<T>(
    settings: string[],
    work: (db: Db, client: PoolClient) => Promise<T>
  ) {
    const client = await pool.connect()
    try {
      for (const setting of settings) await client.query(setting)
      return await work(drizzle(client, { schema }), client)
    } finally {
      await client.query('RESET ALL')
      client.release()
    }
  }

  type Query = { toSQL(): { sql: string; params: unknown[] } }
  const plan = (settings: string[], query: Query) =>
    under(settings, async (_, client) => {
      const { sql: text, params } = query.toSQL()
      const { rows } = await client.query(`EXPLAIN ${text}`, params)
      return rows.map((row) => row['QUERY PLAN']).join('\n')
    })

  const clippingsMatching = (on: Db, query: string) =>
    on
      .select({ content: schema.clippings.content })
      .from(schema.clippings)
      .where(clippingMatches(query))
  const usersMatching = (on: Db, query: string) =>
    on
      .select({ domain: schema.users.domain })
      .from(schema.users)
      .where(userMatches(query))

  it('serves both searches from the PGroonga indexes', async () => {
    // The index name is also in the query text, so match the plan node.
    await expect(plan(INDEX, clippingsMatching(db, 'sea'))).resolves.toMatch(
      /Index Scan (using|on) clippings_search_pgroonga/
    )
    await expect(plan(INDEX, usersMatching(db, 'owner'))).resolves.toMatch(
      /Index Scan (using|on) users_search_pgroonga/
    )
  })

  it('matches the same way when Postgres checks rows outside the index', async () => {
    await expect(
      plan(NO_INDEX, clippingsMatching(db, 'sea'))
    ).resolves.toContain('Seq Scan')
    for (const query of [
      'nake',
      'ｓｎａｋｅ',
      '0%',
      '冰',
      '百年孤独 冰块',
      'man -destroyed',
    ]) {
      const viaIndex = await under(INDEX, (on) => clippingsMatching(on, query))
      const withoutIndex = await under(NO_INDEX, (on) =>
        clippingsMatching(on, query)
      )
      expect(withoutIndex, query).toEqual(viaIndex)
    }
    for (const query of ['angsa', '张', 'OWN']) {
      const viaIndex = await under(INDEX, (on) => usersMatching(on, query))
      const withoutIndex = await under(NO_INDEX, (on) =>
        usersMatching(on, query)
      )
      expect(withoutIndex, query).toEqual(viaIndex)
      expect(viaIndex, query).toHaveLength(1)
    }
  })

  it.each([
    ['冰块', '多年以后'],
    ['冰', '多年以后'],
    ['行刑队 下午', '多年以后'],
    ['対極', '死は生'],
    ['동물', '나는'],
  ])('finds CJK text: %s', async (query, start) => {
    const [match, ...rest] = await found(query)
    expect(rest).toEqual([])
    expect(match.startsWith(start)).toBe(true)
  })

  it('matches substrings regardless of case and width', async () => {
    expect(await found('nake')).toEqual(['snake_case'])
    expect(await found('SNAKE')).toEqual(['snake_case'])
    expect(await found('ｓｎａｋｅ')).toEqual(['snake_case'])
    expect(await found('destr')).toHaveLength(1)
  })

  it.each([
    ['%', ['100% sure']],
    ['0%', ['100% sure']],
    ['_', ['snake_case']],
  ])('matches %j literally, never as a wildcard', async (query, expected) => {
    expect(await found(query)).toEqual(expected)
  })

  it('lets terms match the book title or the highlight', async () => {
    expect(await found('百年孤独 冰块')).toHaveLength(1)
    expect(await found('old sea defeat')).toHaveLength(1)
  })

  it('understands Groonga query syntax', async () => {
    expect((await found('defeat OR 동물')).sort()).toEqual([
      'But man is not made for defeat. A man can be destroyed but not defeated.',
      '나는 이제 동물이 아니야, 언니.',
    ])
    expect(await found('man -destroyed')).toEqual([])
    expect(await found('"man can be"')).toHaveLength(1)
    expect(await found('"be can man"')).toEqual([])
  })

  it('never raises on malformed syntax, and a blank query matches nothing', async () => {
    for (const query of ['(sure', '"unclosed', ')', 'OR', '\\', '*', ':'])
      await expect(found(query)).resolves.toBeInstanceOf(Array)
    expect(await found('')).toEqual([])
    expect(await found('   ')).toEqual([])
  })

  it('keeps private highlights out of the community search', async () => {
    expect(await found('whale')).toEqual([])
  })

  it('searches the reader’s own private highlights', async () => {
    const mine = await resolvers.Query.search(
      {},
      { query: 'whale', scope: 'Me', type: 'BookName' },
      as(OWNER)
    )
    expect(mine.clippings.map((row: schema.Clipping) => row.content)).toEqual([
      'my own private whale',
    ])
    const mcp = await searchClippings(
      OWNER,
      { query: 'private whale' },
      { order: 'newest', limit: 10 }
    )
    expect(mcp.total).toBe(1)
    expect(mcp.items.map((row) => row.content)).toEqual([
      'my own private whale',
    ])
  })

  it('finds readers by name or domain', async () => {
    expect((await community('张')).users).toEqual(['zhangsan'])
    expect((await community('angsa')).users).toEqual(['zhangsan'])
    expect((await community('OWN')).users).toEqual(['owner'])
  })
})
