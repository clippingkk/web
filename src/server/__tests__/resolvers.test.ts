// @vitest-environment node

import { orders, type Clipping, type User } from '../db/schema'
import type { GraphQLContext } from '../graphql/context'
import { resolvers } from '../graphql/resolvers'

const { getDatabaseMock } = vi.hoisted(() => ({
  getDatabaseMock: vi.fn(),
}))

vi.mock('../db', () => ({ getDatabase: getDatabaseMock }))

beforeEach(() => {
  getDatabaseMock.mockReset()
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
