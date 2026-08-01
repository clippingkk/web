// @vitest-environment node

import {
  clippings,
  nouns,
  orders,
  type Clipping,
  type User,
} from '../db/schema'
import type { GraphQLContext } from '../graphql/context'
import { resolvers } from '../graphql/resolvers'

const { cacheDeleteMock, getDatabaseMock } = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  getDatabaseMock: vi.fn(),
}))

vi.mock('../db', () => ({ getDatabase: getDatabaseMock }))
vi.mock('../redis', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../redis')>()),
  cacheDelete: cacheDeleteMock,
}))

beforeEach(() => {
  cacheDeleteMock.mockReset()
  getDatabaseMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

test('treats legacy null clipping nouns as an empty list', async () => {
  const clipping = {
    content: 'A legacy clipping',
    nouns: null,
  } as unknown as Clipping

  await expect(resolvers.Clipping.richContent(clipping)).resolves.toEqual({
    html: 'A legacy clipping',
    plain: 'A legacy clipping',
    segments: ['A legacy clipping'],
    nouns: [],
  })
})

test('selects only legacy-compatible fields for a user order list', async () => {
  const order = {
    id: 9,
    orderId: 'order_9',
    sku: 'premium',
    subscriptionId: 'subscription_9',
    orderCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
    amount: 999,
    currency: 'usd',
  }
  const orderBy = vi.fn().mockResolvedValue([order])
  const where = vi.fn(() => ({ orderBy }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn((fields: Record<string, unknown>) => {
    expect(fields).not.toHaveProperty('createdAt')
    expect(fields).not.toHaveProperty('updatedAt')
    return { from }
  })
  getDatabaseMock.mockReturnValue({ db: { select } })

  await expect(
    resolvers.User.orderList({ id: 2 } as User, {}, {
      userId: 2,
    } as GraphQLContext)
  ).resolves.toEqual([
    {
      id: 'subscription_9',
      subscriptionId: 'subscription_9',
      status: 'active',
      orders: [order],
    },
  ])
  expect(select).toHaveBeenCalledWith({
    id: orders.id,
    orderId: orders.orderId,
    sku: orders.sku,
    subscriptionId: orders.subscriptionId,
    orderCreatedAt: orders.orderCreatedAt,
    amount: orders.amount,
    currency: orders.currency,
  })
})

test('selects only legacy-compatible noun fields when creating clippings', async () => {
  const uploadedAt = new Date('2026-08-01T12:00:00.000Z')
  vi.useFakeTimers()
  vi.setSystemTime(uploadedAt)
  const where = vi.fn().mockResolvedValue([{ id: 7, noun: 'global noun' }])
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))
  const returning = vi.fn().mockResolvedValue([])
  const onConflictDoNothing = vi.fn(() => ({ returning }))
  const values = vi.fn(() => ({ onConflictDoNothing }))
  const insert = vi.fn(() => ({ values }))
  getDatabaseMock.mockReturnValue({ db: { insert, select } })

  await expect(
    resolvers.Mutation.createClippings(
      {},
      {
        visible: true,
        payload: [
          {
            title: 'Example',
            content: 'A global noun appears here',
            bookID: 'book-1',
            pageAt: '12',
            createdAt: '2026-01-01T00:00:00.000Z',
            source: 'kindle',
          },
          {
            title: 'Another example',
            content: 'No matching noun',
            bookID: 'book-2',
            pageAt: '24',
            createdAt: 'not-a-date',
            source: 'kindle',
          },
        ],
      },
      { userId: 2 } as GraphQLContext
    )
  ).resolves.toEqual([])

  expect(select).toHaveBeenCalledWith({ id: nouns.id, noun: nouns.noun })
  expect(insert).toHaveBeenCalledWith(clippings)
  expect(values).toHaveBeenCalledWith([
    expect.objectContaining({
      content: 'A global noun appears here',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      nouns: [7],
      updatedAt: uploadedAt,
    }),
    expect.objectContaining({
      content: 'No matching noun',
      createdAt: uploadedAt,
      nouns: [],
      updatedAt: uploadedAt,
    }),
  ])
  expect(cacheDeleteMock).toHaveBeenCalledWith('ck:books:2')
})
