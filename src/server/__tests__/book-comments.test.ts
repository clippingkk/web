// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// No imports inside vi.hoisted: see resolvers-visibility.test.ts.
const getDatabaseMock = vi.hoisted(() => vi.fn())
const rateLimitMock = vi.hoisted(() => vi.fn())
const canAdminMock = vi.hoisted(() => vi.fn())
vi.mock('../db', () => ({ getDatabase: getDatabaseMock }))
vi.mock('../redis', () => ({ rateLimit: rateLimitMock }))
vi.mock('../gate/authz', () => ({ canAdmin: canAdminMock }))

import { BOOK_COMMENTS_PER_HOUR } from '../book-comments'
import type { BookCommentRow } from '../book-comments'
import { migratePglite } from '../db/__tests__/pglite'
import * as schema from '../db/schema'
import type { GraphQLContext } from '../graphql/context'
import { resolvers } from '../graphql/resolvers'

const OWNER = 1
const OTHER = 2
const READER = 3
const ADMIN = 4
const GONE = 5
const ANONYMOUS = 0

const BOOK = '6082808'
const PRIVATE_BOOK = '1000001'
const UNKNOWN_BOOK = '9999999'
const TEXT = 'A comment long enough to pass the forty character minimum.'

const as = (userId: number) => ({ userId }) as GraphQLContext

const pg = new PGlite()
const db = drizzle(pg, { schema })

async function seed() {
  await db.insert(schema.users).values(
    [OWNER, OTHER, READER, ADMIN, GONE].map((id) => ({
      id,
      name: `user-${id}`,
      email: `user-${id}@example.com`,
      pwd: '',
      checked: true,
      deletedAt: id === GONE ? new Date() : null,
    }))
  )
  const rows: [number, string, boolean][] = [
    // creator, book, visible
    [OWNER, BOOK, true],
    [OWNER, BOOK, true],
    [OWNER, BOOK, false],
    [OTHER, BOOK, false],
    [OWNER, PRIVATE_BOOK, false],
  ]
  await db.insert(schema.clippings).values(
    rows.map(([createdBy, bookId, visible], index) => ({
      title: `clipping ${index}`,
      content: 'content',
      bookId,
      dataId: `clipping-${index}`,
      createdBy,
      visible,
    }))
  )
}

async function post(userId: number, content = TEXT, doubanId = BOOK) {
  return (await resolvers.Mutation.createBookComment(
    {},
    { doubanId, content },
    as(userId)
  )) as BookCommentRow
}

function list(viewer: number, pagination?: object, doubanId = BOOK) {
  return resolvers.Query.bookComments(
    {},
    { doubanId, pagination },
    as(viewer)
  ) as Promise<{ count: number; items: BookCommentRow[] }>
}

beforeAll(async () => {
  await migratePglite(pg)
}, 30000)
beforeEach(async () => {
  await pg.exec('TRUNCATE users, clippings, book_comments RESTART IDENTITY')
  getDatabaseMock.mockReturnValue({ db })
  rateLimitMock.mockReset()
  rateLimitMock.mockResolvedValue({ allowed: true, count: 1 })
  canAdminMock.mockReset()
  canAdminMock.mockImplementation(async (id: number) => id === ADMIN)
  await seed()
})
afterAll(() => pg.close())

describe('createBookComment', () => {
  it('needs a signed-in reader', async () => {
    await expect(post(ANONYMOUS)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
    })
  })

  it('lets any reader comment on a book with a public highlight', async () => {
    const comment = await post(READER, `  ${TEXT}  `)
    expect(comment).toMatchObject({
      bookId: BOOK,
      createdBy: READER,
      content: TEXT,
      creatorClippingsCount: 0,
    })
    expect(rateLimitMock).toHaveBeenCalledWith(
      `ck:book-comment:${READER}`,
      BOOK_COMMENTS_PER_HOUR,
      3600
    )
  })

  it('does not confirm a book that is only in someone else’s private library', async () => {
    await expect(post(READER, TEXT, PRIVATE_BOOK)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    })
    await expect(post(READER, TEXT, UNKNOWN_BOOK)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
    await expect(post(OWNER, TEXT, PRIVATE_BOOK)).resolves.toMatchObject({
      bookId: PRIVATE_BOOK,
    })
  })

  it('refuses ids that are not a matched Douban book', async () => {
    for (const doubanId of ['', '0', 'abc', '12a', '-1', '1'.repeat(21)])
      await expect(post(OWNER, TEXT, doubanId)).rejects.toMatchObject({
        code: 'NOT_FOUND',
      })
  })

  it('checks the length after trimming', async () => {
    await expect(post(READER, ` ${'a'.repeat(39)} `)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      status: 400,
    })
    await expect(post(READER, 'a'.repeat(5001))).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    })
    await expect(post(READER, 'a'.repeat(5000))).resolves.toBeTruthy()
  })

  it('stops a reader after the hourly limit', async () => {
    rateLimitMock.mockResolvedValueOnce({ allowed: false, count: 21 })
    await expect(post(READER)).rejects.toMatchObject({ status: 429 })
    expect((await list(ANONYMOUS)).count).toBe(0)
  })

  it('does not spend the limit on a refused comment', async () => {
    await expect(post(READER, 'short')).rejects.toBeTruthy()
    await expect(post(READER, TEXT, PRIVATE_BOOK)).rejects.toBeTruthy()
    expect(rateLimitMock).not.toHaveBeenCalled()
  })
})

describe('bookComments', () => {
  it('lists newest first and pages by lastId', async () => {
    for (const author of [OWNER, OTHER, READER]) await post(author)
    const first = await list(ANONYMOUS, { limit: 2 })
    expect(first.count).toBe(3)
    expect(first.items.map((item) => item.createdBy)).toEqual([READER, OTHER])
    const next = await list(ANONYMOUS, {
      limit: 2,
      lastId: first.items.at(-1)?.id,
    })
    expect(next.items.map((item) => item.createdBy)).toEqual([OWNER])
  })

  it('is empty for a malformed id instead of failing', async () => {
    await expect(list(ANONYMOUS, undefined, 'nope')).resolves.toEqual({
      count: 0,
      items: [],
    })
  })

  it('leaves out deleted comments and deleted accounts', async () => {
    const kept = await post(OWNER)
    const removed = await post(READER)
    await resolvers.Mutation.deleteBookComment(
      {},
      { id: removed.id },
      as(READER)
    )
    await db
      .insert(schema.bookComments)
      .values({ bookId: BOOK, createdBy: GONE, content: TEXT })
    const page = await list(ANONYMOUS)
    expect(page.count).toBe(1)
    expect(page.items.map((item) => item.id)).toEqual([kept.id])
  })

  it('counts only the highlights the viewer may see for the badge', async () => {
    await post(OWNER)
    await post(OTHER)
    const badge = async (viewer: number) =>
      Object.fromEntries(
        (await list(viewer)).items.map((item) => [
          item.createdBy,
          item.creatorClippingsCount,
        ])
      )
    // OWNER has 2 public and 1 private highlight; OTHER has 1 private.
    expect(await badge(ANONYMOUS)).toEqual({ [OWNER]: 2, [OTHER]: 0 })
    expect(await badge(OWNER)).toEqual({ [OWNER]: 3, [OTHER]: 0 })
    expect(await badge(OTHER)).toEqual({ [OWNER]: 2, [OTHER]: 1 })
  })

  it('resolves the badge lazily for a single comment', async () => {
    const row = await post(OWNER)
    const { creatorClippingsCount: _, ...bare } = row
    await expect(
      resolvers.BookComment.creatorClippingsCount(bare, {}, as(READER))
    ).resolves.toBe(2)
    expect(resolvers.BookComment.doubanId(bare)).toBe(BOOK)
  })
})

describe('deleteBookComment', () => {
  it('lets the author and administrators delete, nobody else', async () => {
    const first = await post(READER)
    const second = await post(READER)
    const remove = (id: number, viewer: number) =>
      resolvers.Mutation.deleteBookComment({}, { id }, as(viewer))
    await expect(remove(first.id, ANONYMOUS)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
    await expect(remove(first.id, OWNER)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
    })
    await expect(remove(first.id, READER)).resolves.toBe(true)
    await expect(remove(second.id, ADMIN)).resolves.toBe(true)
    await expect(remove(first.id, READER)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
    expect((await list(ANONYMOUS)).count).toBe(0)
  })
})
