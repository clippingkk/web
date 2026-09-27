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
  const schema = await import('../db/schema')
  const pg = new PGlite()
  return { pg, db: drizzle(pg, { schema }) }
})
vi.mock('../db', () => ({ getDatabase: vi.fn() }))

import { getDatabase } from '../db'
import * as schema from '../db/schema'
import type { Clipping, Comment } from '../db/schema'
import { ApiError } from '../errors'
import type { GraphQLContext } from '../graphql/context'
import { resolvers } from '../graphql/resolvers'

const OWNER = 1
const OTHER = 2
const READER = 3
const ANONYMOUS = 0

const as = (userId: number) => ({ userId }) as GraphQLContext

/** Rows seeded in id order; `ids` maps the names used below to their ids. */
const ids: Record<string, number> = {}

async function seed() {
  const { db } = await storage
  await db.insert(schema.users).values(
    [OWNER, OTHER, READER].map((id) => ({
      id,
      name: `user-${id}`,
      email: `user-${id}@example.com`,
      pwd: '',
      checked: true,
    }))
  )
  const at = (month: number) => new Date(Date.UTC(2025, month, 1))
  const rows: [string, number, string, boolean, Date][] = [
    // name, creator, book, visible, createdAt
    ['ownerA', OWNER, 'book-1', true, at(0)],
    ['otherPublic', OTHER, 'book-1', true, at(1)],
    ['ownerPrivate', OWNER, 'book-1', false, at(2)],
    ['otherPrivate', OTHER, 'book-1', false, at(3)],
    ['ownerB', OWNER, 'book-1', true, at(4)],
    ['ownerOtherBook', OWNER, 'book-2', true, at(5)],
  ]
  for (const [name, createdBy, bookId, visible, createdAt] of rows) {
    const [row] = await db
      .insert(schema.clippings)
      .values({
        title: name,
        content: `content of ${name}`,
        bookId,
        dataId: name,
        createdBy,
        visible,
        createdAt,
      })
      .returning()
    ids[name] = row.id
  }
  for (const [name, belongsTo] of [
    ['onPublic', ids.ownerA],
    ['onPrivate', ids.ownerPrivate],
  ] as const) {
    const [row] = await db
      .insert(schema.comments)
      .values({ belongsTo, createdBy: READER, content: name })
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
  const { pg } = await storage
  await pg.exec(
    'TRUNCATE users, clippings, comments RESTART IDENTITY; ALTER SEQUENCE users_id_seq RESTART WITH 100'
  )
  vi.mocked(getDatabase).mockReturnValue({ db: (await storage).db } as never)
  await seed()
})
afterAll(async () => (await storage).pg.close())

async function clipping(name: string) {
  const { db } = await storage
  return (await db.query.clippings.findFirst({
    where: (table, { eq }) => eq(table.id, ids[name]),
  })) as Clipping
}

describe('prevClipping / nextClipping', () => {
  it.each([
    // viewer, expected user-order prev, expected book-order prev
    ['an anonymous reader', ANONYMOUS, 'ownerA', 'ownerA'],
    ['another reader', READER, 'ownerA', 'ownerA'],
    // OTHER's own private clipping of the same book is still not a sibling.
    ['another creator', OTHER, 'ownerA', 'ownerA'],
    ['the creator', OWNER, 'ownerPrivate', 'ownerPrivate'],
  ])(
    'for %s, only steps through visible clippings of the same creator',
    async (_, viewer, userPrev, bookPrev) => {
      await expect(
        resolvers.Clipping.prevClipping(
          await clipping('ownerB'),
          {},
          as(viewer)
        )
      ).resolves.toEqual({
        userClippingID: ids[userPrev],
        bookClippingID: ids[bookPrev],
      })
    }
  )

  it('walks forward the same way', async () => {
    await expect(
      resolvers.Clipping.nextClipping(
        await clipping('ownerA'),
        {},
        as(ANONYMOUS)
      )
    ).resolves.toEqual({
      userClippingID: ids.ownerB,
      bookClippingID: ids.ownerB,
    })
    await expect(
      resolvers.Clipping.nextClipping(await clipping('ownerA'), {}, as(OWNER))
    ).resolves.toEqual({
      userClippingID: ids.ownerPrivate,
      bookClippingID: ids.ownerPrivate,
    })
  })

  it('keeps the book order within the book', async () => {
    await expect(
      resolvers.Clipping.nextClipping(await clipping('ownerB'), {}, as(OWNER))
    ).resolves.toEqual({
      userClippingID: ids.ownerOtherBook,
      bookClippingID: 0,
    })
  })
})

describe('reportYearly', () => {
  async function report(viewer: number) {
    const result = await resolvers.Query.reportYearly(
      {},
      { uid: OWNER, year: 2025 },
      as(viewer)
    )
    return Object.fromEntries(
      result.books.map((book: { doubanId: string; clippingsCount: number }) => [
        book.doubanId,
        book.clippingsCount,
      ])
    )
  }

  it('counts only the clippings the viewer may see', async () => {
    expect(await report(ANONYMOUS)).toEqual({ 'book-1': 2, 'book-2': 1 })
    expect(await report(READER)).toEqual({ 'book-1': 2, 'book-2': 1 })
  })

  it('counts everything for the creator', async () => {
    expect(await report(OWNER)).toEqual({ 'book-1': 3, 'book-2': 1 })
  })
})

describe('comments', () => {
  async function comment(name: string) {
    const { db } = await storage
    return (await db.query.comments.findFirst({
      where: (table, { eq }) => eq(table.id, ids[name]),
    })) as Comment
  }

  it('never resolves belongsTo to a clipping the viewer may not see', async () => {
    for (const viewer of [ANONYMOUS, READER, OTHER]) {
      const error = await resolvers.Comment.belongsTo(
        await comment('onPrivate'),
        {},
        as(viewer)
      ).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ApiError)
      expect(error).toMatchObject({ code: 'NOT_FOUND', status: 404 })
    }
  })

  it('resolves belongsTo for the clipping owner and for public clippings', async () => {
    await expect(
      resolvers.Comment.belongsTo(await comment('onPrivate'), {}, as(OWNER))
    ).resolves.toMatchObject({ id: ids.ownerPrivate })
    await expect(
      resolvers.Comment.belongsTo(await comment('onPublic'), {}, as(ANONYMOUS))
    ).resolves.toMatchObject({ id: ids.ownerA })
  })

  it('leaves comments on hidden clippings out of lists and counts', async () => {
    const list = (viewer: number) =>
      resolvers.Query.getCommentList({}, { uid: READER }, as(viewer))
    await expect(list(ANONYMOUS)).resolves.toMatchObject({
      count: 1,
      items: [{ id: ids.onPublic }],
    })
    await expect(list(OWNER)).resolves.toMatchObject({
      count: 2,
      items: [{ id: ids.onPrivate }, { id: ids.onPublic }],
    })

    const profile = await resolvers.User.commentList(
      { id: READER } as never,
      {},
      as(ANONYMOUS)
    )
    expect(profile.count).toBe(1)
    expect(profile.items.map((item: Comment) => item.content)).toEqual([
      'onPublic',
    ])
  })

  it('does not hand out a single comment on a hidden clipping', async () => {
    const get = (name: string, viewer: number) =>
      resolvers.Query.getComment({}, { id: ids[name] }, as(viewer))
    await expect(get('onPrivate', READER)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
    await expect(get('onPrivate', OWNER)).resolves.toMatchObject({
      content: 'onPrivate',
    })
    await expect(get('onPublic', ANONYMOUS)).resolves.toMatchObject({
      content: 'onPublic',
    })
  })

  it('refuses a comment on a clipping the commenter may not see', async () => {
    await expect(
      resolvers.Mutation.createComment(
        {},
        { cid: ids.ownerPrivate, content: 'probe' },
        as(READER)
      )
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(
      resolvers.Mutation.createComment(
        {},
        { cid: ids.ownerPrivate, content: 'note to self' },
        as(OWNER)
      )
    ).resolves.toMatchObject({ belongsTo: ids.ownerPrivate })
  })
})

describe('Noun.clipping', () => {
  it('is null for a clipping the viewer may not see', async () => {
    const noun = { clippingId: ids.ownerPrivate } as never
    await expect(
      resolvers.Noun.clipping(noun, {}, as(READER))
    ).resolves.toBeNull()
    await expect(
      resolvers.Noun.clipping(noun, {}, as(OWNER))
    ).resolves.toMatchObject({ id: ids.ownerPrivate })
    await expect(
      resolvers.Noun.clipping({ clippingId: -1 } as never, {}, as(OWNER))
    ).resolves.toBeNull()
  })
})

describe('search', () => {
  async function add(content: string) {
    const { db } = await storage
    await db.insert(schema.clippings).values({
      title: 'Search',
      content,
      dataId: content,
      createdBy: OWNER,
    })
  }

  async function found(query: string) {
    const result = await resolvers.Query.search(
      {},
      { query, type: 'BookName' },
      as(ANONYMOUS)
    )
    return result.clippings.map((row: Clipping) => row.content).sort()
  }

  it.each([
    ['%', ['100% sure']],
    ['_', ['snake_case']],
    ['\\', ['back\\slash']],
    ['0%', ['100% sure']],
  ])('matches %j literally', async (query, expected) => {
    await Promise.all(['100% sure', 'snake_case', 'back\\slash'].map(add))
    expect(await found(query)).toEqual(expected)
  })

  it('still matches case-insensitive substrings', async () => {
    await add('Snake_Case')
    expect(await found('snake')).toEqual(['Snake_Case'])
  })

  it('never returns a private clipping', async () => {
    expect(await found('ownerPrivate')).toEqual([])
  })
})

describe('book', () => {
  it('is NOT_FOUND when the viewer can see none of its clippings', async () => {
    const { db } = await storage
    await db.insert(schema.clippings).values({
      title: 'Hidden',
      content: 'hidden',
      bookId: 'book-hidden',
      dataId: 'hidden',
      createdBy: OWNER,
      visible: false,
    })
    const error = await resolvers.Query.book(
      {},
      { id: 'book-hidden', uid: OWNER },
      as(ANONYMOUS)
    ).catch((e: unknown) => e)
    expect(error).toMatchObject({ code: 'NOT_FOUND', status: 404 })
    await expect(
      resolvers.Query.book({}, { id: 'book-hidden', uid: OWNER }, as(OWNER))
    ).resolves.toMatchObject({ clippingsCount: 1 })
  })
})

describe('updateUserProfile', () => {
  it.each(['12345', '000'])(
    'rejects the all-digit domain %s',
    async (domain) => {
      await expect(
        resolvers.Mutation.updateUserProfile({}, { domain }, as(OWNER))
      ).rejects.toThrow('Domain cannot be only numbers.')
    }
  )

  it.each(['ab', '-abc', 'annatar.he', 'a'.repeat(33)])(
    'rejects the malformed domain %s',
    async (domain) => {
      await expect(
        resolvers.Mutation.updateUserProfile({}, { domain }, as(OWNER))
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    }
  )

  it('stores a valid domain lowercase', async () => {
    await expect(
      resolvers.Mutation.updateUserProfile(
        {},
        { domain: ' AnnatarHe ' },
        as(OWNER)
      )
    ).resolves.toMatchObject({ domain: 'annatarhe' })
  })
})
