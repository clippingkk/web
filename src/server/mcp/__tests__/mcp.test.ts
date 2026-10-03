// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const storage = vi.hoisted(async () => {
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')
  const schema = await import('../../db/schema')
  const pg = new PGlite()
  return { pg, db: drizzle(pg, { schema }) }
})
const { connection, rateLimit, wenquRequest } = vi.hoisted(() => ({
  connection: vi.fn(async () => {}),
  rateLimit: vi.fn(async () => ({ allowed: true, count: 1 })),
  wenquRequest: vi.fn(),
}))
vi.mock('next/server', () => ({ connection }))
vi.mock('../../db', () => ({ getDatabase: vi.fn() }))
vi.mock('../../redis', () => ({
  rateLimit,
  cacheGet: vi.fn(async () => undefined),
  cacheSet: vi.fn(async () => {}),
}))
vi.mock('../../billing/premium', () => ({ isPremium: vi.fn(async () => true) }))
vi.mock('@/services/wenqu', async (actual) => ({
  ...(await actual<typeof import('@/services/wenqu')>()),
  wenquRequest,
}))

import { DELETE, GET, POST } from '@/app/api/v3/mcp/route'
import { resetServerEnvForTests } from '@/server/env'

import { getDatabase } from '../../db'
import * as schema from '../../db/schema'
import {
  createMcpToken,
  listMcpTokens,
  MAX_ACTIVE_TOKENS,
  resolveMcpToken,
  revokeMcpToken,
} from '../tokens'

const OWNER = 1
const OTHER = 2
const BOOK = '12345678'
const ORIGIN = 'https://clippingkk.example'
const ids: Record<string, number> = {}
let token = ''

async function seed() {
  const { db } = await storage
  await db.insert(schema.users).values([
    {
      id: OWNER,
      name: 'Owner',
      email: 'owner@example.com',
      pwd: '',
      checked: true,
      domain: 'owner',
      gateUserId: 'gate-owner',
    },
    {
      id: OTHER,
      name: 'Other',
      email: 'o@example.com',
      pwd: '',
      checked: true,
    },
  ])
  const at = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d))
  const rows: [string, number, string, string, boolean, number, Date][] = [
    // name, creator, bookId, content, visible, source, createdAt
    ['sea', OWNER, BOOK, 'The sea is wide', true, 1, at(2025, 0, 5)],
    ['whale', OWNER, BOOK, 'A private whale', false, 1, at(2025, 2, 10)],
    ['kindleOnly', OWNER, '', 'An old note', true, 2, at(2024, 5, 1)],
    [
      'otherSea',
      OTHER,
      BOOK,
      'The sea from elsewhere',
      true,
      1,
      at(2025, 0, 6),
    ],
  ]
  for (const [
    name,
    createdBy,
    bookId,
    content,
    visible,
    source,
    createdAt,
  ] of rows) {
    const [row] = await db
      .insert(schema.clippings)
      .values({
        title: name === 'kindleOnly' ? 'Kindle Only Book' : 'Raw Kindle Title',
        content,
        bookId,
        dataId: name,
        createdBy,
        visible,
        source,
        createdAt,
      })
      .returning()
    ids[name] = row.id
  }
}

beforeAll(async () => {
  const { pg, db } = await storage
  for (const name of (await readdir('drizzle'))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    await pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
}, 30000)

beforeEach(async () => {
  process.env.DATABASE_URL = 'postgresql://postgres:admin@localhost:5432/test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.APP_ORIGIN = ORIGIN
  process.env.GATE_RESOURCE = ORIGIN
  process.env.CORS_ALLOWED_ORIGINS = ''
  resetServerEnvForTests()
  const { pg, db } = await storage
  await pg.exec('TRUNCATE users, clippings, mcp_tokens RESTART IDENTITY')
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
  rateLimit.mockResolvedValue({ allowed: true, count: 1 })
  wenquRequest.mockResolvedValue({
    count: 1,
    books: [
      {
        doubanId: Number(BOOK),
        title: 'The Real Title',
        author: 'An Author',
        image: 'cover.jpg',
        tags: [],
      },
    ],
  })
  await seed()
  ;({ token } = await createMcpToken(OWNER, 'test'))
})
afterAll(async () => (await storage).pg.close())

const META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'test', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
}

function request(
  method: string,
  params: Record<string, unknown> = {},
  headers: Record<string, string> = {}
) {
  const name: Record<string, string> =
    typeof params.name === 'string' ? { 'mcp-name': params.name } : {}
  return new Request(`${ORIGIN}/api/v3/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': method,
      authorization: `Bearer ${token}`,
      ...name,
      ...headers,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params: { ...params, _meta: META },
    }),
  })
}

async function rpc(
  method: string,
  params?: Record<string, unknown>,
  headers?: Record<string, string>
) {
  const response = await POST(request(method, params, headers))
  return { status: response.status, body: await response.json() }
}

async function call(name: string, args: Record<string, unknown> = {}) {
  const { body } = await rpc('tools/call', { name, arguments: args })
  return body.result as {
    isError?: boolean
    structuredContent: any
    content: { text: string }[]
  }
}

describe('the endpoint', () => {
  it('challenges a request without a token and points at the resource metadata', async () => {
    const response = await POST(
      request('tools/list', {}, { authorization: '' })
    )
    expect(response.status).toBe(401)
    expect(response.headers.get('www-authenticate')).toContain(
      `resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource"`
    )
  })

  it('rejects unknown and revoked tokens', async () => {
    const [{ id }] = await listMcpTokens(OWNER)
    await revokeMcpToken(OWNER, id)
    expect((await rpc('tools/list')).status).toBe(401)
    expect(
      (await rpc('tools/list', {}, { authorization: 'Bearer ck_mcp_nope' }))
        .status
    ).toBe(401)
  })

  it('refuses browsers from an untrusted origin', async () => {
    const { status } = await rpc(
      'tools/list',
      {},
      { origin: 'https://evil.example' }
    )
    expect(status).toBe(403)
  })

  it('answers 429 once the reader is rate limited', async () => {
    rateLimit.mockResolvedValueOnce({ allowed: false, count: 121 })
    expect((await rpc('tools/list')).status).toBe(429)
  })

  it('serves discovery and a stable tool list on 2026-07-28', async () => {
    const discover = await rpc('server/discover')
    expect(discover.status).toBe(200)
    expect(
      discover.body.result.supportedVersions ?? discover.body.result
    ).toBeTruthy()

    const { status, body } = await rpc('tools/list')
    expect(status).toBe(200)
    expect(body.result.resultType).toBe('complete')
    expect(body.result.tools.map((t: { name: string }) => t.name)).toEqual([
      'get_profile',
      'get_yearly_report',
      'get_reading_stats',
      'list_books',
      'get_book',
      'search_clippings',
      'get_clipping',
    ])
    for (const tool of body.result.tools)
      expect(tool.annotations.readOnlyHint).toBe(true)
  })

  it('still serves 2025-era clients statelessly', async () => {
    const response = await POST(
      new Request(`${ORIGIN}/api/v3/mcp`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json, text/event-stream',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-11-25',
            capabilities: {},
            clientInfo: { name: 'legacy', version: '1.0.0' },
          },
        }),
      })
    )
    expect(response.status).toBe(200)
    const text = await response.text()
    expect(text).toContain('"protocolVersion":"2025-11-25"')
  })

  it('has no session stream to GET or DELETE', async () => {
    const get = new Request(`${ORIGIN}/api/v3/mcp`, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'text/event-stream',
      },
    })
    expect((await GET(get)).status).toBe(405)
    const del = new Request(`${ORIGIN}/api/v3/mcp`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    })
    expect((await DELETE(del)).status).toBe(405)
  })
})

describe('search_clippings', () => {
  const contents = (result: Awaited<ReturnType<typeof call>>) =>
    result.structuredContent.items.map(
      (item: { content: string }) => item.content
    )

  it('searches only the reader’s own highlights, private ones included', async () => {
    expect(contents(await call('search_clippings', { query: 'sea' }))).toEqual([
      'The sea is wide',
    ])
    expect(
      contents(await call('search_clippings', { query: 'whale' }))
    ).toEqual(['A private whale'])
    const all = await call('search_clippings')
    expect(all.structuredContent.total).toBe(3)
    expect(contents(all)).not.toContain('The sea from elsewhere')
  })

  it('applies every filter', async () => {
    expect(
      contents(await call('search_clippings', { visibility: 'private' }))
    ).toEqual(['A private whale'])
    expect(
      contents(await call('search_clippings', { source: 'weread' }))
    ).toEqual(['An old note'])
    expect(
      contents(
        await call('search_clippings', { from: '2025-01-01', to: '2025-02-01' })
      )
    ).toEqual(['The sea is wide'])
    expect(
      contents(
        await call('search_clippings', { doubanId: BOOK, order: 'oldest' })
      )
    ).toEqual(['The sea is wide', 'A private whale'])
    expect(
      contents(await call('search_clippings', { bookTitle: 'kindle only' }))
    ).toEqual(['An old note'])
    // A literal `%` must not act as a wildcard.
    expect(contents(await call('search_clippings', { query: '%' }))).toEqual([])
  })

  it('pages with a cursor', async () => {
    const first = await call('search_clippings', { limit: 2 })
    expect(contents(first)).toEqual(['A private whale', 'The sea is wide'])
    const second = await call('search_clippings', {
      limit: 2,
      cursor: first.structuredContent.nextCursor,
    })
    expect(contents(second)).toEqual(['An old note'])
    expect(second.structuredContent.nextCursor).toBeNull()
  })

  it('names books from Wenqu and links to the clipping', async () => {
    const [item] = (await call('search_clippings', { query: 'sea' }))
      .structuredContent.items
    expect(item).toMatchObject({
      bookTitle: 'The Real Title',
      doubanId: BOOK,
      source: 'kindle',
      url: `${ORIGIN}/dash/owner/clippings/${ids.sea}`,
    })
    const [unmatched] = (await call('search_clippings', { query: 'old note' }))
      .structuredContent.items
    expect(unmatched).toMatchObject({
      bookTitle: 'Kindle Only Book',
      doubanId: null,
    })
  })
})

describe('the other tools', () => {
  it('get_clipping never returns another reader’s clipping', async () => {
    expect(
      (await call('get_clipping', { id: ids.whale })).structuredContent.content
    ).toBe('A private whale')
    expect((await call('get_clipping', { id: ids.otherSea })).isError).toBe(
      true
    )
  })

  it('list_books and get_book', async () => {
    const books = await call('list_books', { includeUnmatched: true })
    expect(books.structuredContent.books).toEqual([
      expect.objectContaining({
        doubanId: BOOK,
        title: 'The Real Title',
        clippingsCount: 2,
      }),
    ])
    expect(books.structuredContent.unmatched).toEqual([
      expect.objectContaining({
        kindleTitle: 'Kindle Only Book',
        clippingsCount: 1,
      }),
    ])
    const book = await call('get_book', { doubanId: BOOK })
    expect(book.structuredContent).toMatchObject({
      title: 'The Real Title',
      author: 'An Author',
      clippingsCount: 2,
      url: `${ORIGIN}/dash/owner/book/${BOOK}`,
    })
    expect((await call('get_book', { doubanId: '99999999' })).isError).toBe(
      true
    )
  })

  it('get_yearly_report', async () => {
    const { structuredContent: report } = await call('get_yearly_report', {
      year: 2025,
    })
    expect(report).toMatchObject({
      year: 2025,
      totalHighlights: 2,
      booksCount: 1,
    })
    expect(report.months).toHaveLength(12)
    expect(report.months[0]).toEqual({ period: '2025-01', count: 1 })
    expect(report.months[2]).toEqual({ period: '2025-03', count: 1 })
    expect(report.busiestDay).toEqual({ period: '2025-01-05', count: 1 })
    expect(report.reportUrl).toBe(
      `${ORIGIN}/report/yearly?uid=${OWNER}&year=2025`
    )
  })

  it('get_reading_stats', async () => {
    const { structuredContent: stats } = await call('get_reading_stats', {
      granularity: 'year',
    })
    expect(stats.buckets).toEqual([
      { period: '2024', count: 1 },
      { period: '2025', count: 2 },
    ])
    expect(stats.years).toEqual([2024, 2025])
    expect(
      (
        await call('get_reading_stats', {
          granularity: 'day',
          from: '2020-01-01',
          to: '2025-01-01',
        })
      ).isError
    ).toBe(true)
  })

  it('get_profile', async () => {
    expect((await call('get_profile')).structuredContent).toMatchObject({
      id: OWNER,
      name: 'Owner',
      premium: true,
      clippingsCount: 3,
      booksCount: 1,
      firstClippingAt: '2024-06-01T00:00:00.000Z',
      profileUrl: `${ORIGIN}/dash/owner/profile`,
    })
  })
})

describe('personal access tokens', () => {
  it('stores only a hash and resolves live tokens', async () => {
    const { db } = await storage
    const [row] = await db.select().from(schema.mcpTokens)
    expect(token).toMatch(/^ck_mcp_[A-Za-z0-9_-]{43}$/)
    expect(row.tokenHash).not.toContain(token.slice(7))
    expect(row.prefix).toBe(token.slice(0, 12))
    await expect(resolveMcpToken(token)).resolves.toMatchObject({
      userId: OWNER,
    })
  })

  it('does not resolve expired tokens or tokens of deleted readers', async () => {
    const { db } = await storage
    await db
      .update(schema.mcpTokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
    await expect(resolveMcpToken(token)).resolves.toBeNull()
    const fresh = await createMcpToken(OWNER, 'fresh', 30)
    await db.update(schema.users).set({ deletedAt: new Date() })
    await expect(resolveMcpToken(fresh.token)).resolves.toBeNull()
  })

  it('caps active tokens per reader', async () => {
    for (let i = 1; i < MAX_ACTIVE_TOKENS; i++)
      await createMcpToken(OWNER, `t${i}`)
    await expect(createMcpToken(OWNER, 'one too many')).rejects.toMatchObject({
      status: 409,
    })
    await expect(createMcpToken(OTHER, 'someone else')).resolves.toBeTruthy()
  })

  it('only the owner can revoke a token', async () => {
    const [{ id }] = await listMcpTokens(OWNER)
    await expect(revokeMcpToken(OTHER, id)).rejects.toMatchObject({
      status: 404,
    })
    await revokeMcpToken(OWNER, id)
    await expect(listMcpTokens(OWNER)).resolves.toEqual([])
  })
})
