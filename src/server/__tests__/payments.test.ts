import type Stripe from 'stripe'

import { recordSucceededPaymentIntent } from '@/server/payments'

const { getDatabaseMock } = vi.hoisted(() => ({
  getDatabaseMock: vi.fn(),
}))

vi.mock('@/server/db', () => ({ getDatabase: getDatabaseMock }))
vi.mock('@/server/integrations', () => ({ getStripe: vi.fn() }))

describe('PaymentSheet fulfillment', () => {
  beforeEach(() => {
    getDatabaseMock.mockReset()
  })

  it('records a succeeded PaymentSheet intent and grants premium', async () => {
    let insertedOrder: Record<string, unknown> | undefined
    let userChanges: Record<string, unknown> | undefined
    const transaction = {
      insert: vi.fn(() => ({
        values: vi.fn((values: Record<string, unknown>) => {
          insertedOrder = values
          return {
            returning: vi.fn().mockResolvedValue([{ id: 91 }]),
          }
        }),
      })),
      update: vi.fn(() => ({
        set: vi.fn((values: Record<string, unknown>) => {
          userChanges = values
          return { where: vi.fn().mockResolvedValue(undefined) }
        }),
      })),
    }
    const db = {
      query: {
        users: {
          findFirst: vi.fn().mockResolvedValue({
            id: 42,
            premiumEndAt: null,
          }),
        },
        orders: { findFirst: vi.fn().mockResolvedValue(undefined) },
      },
      transaction: vi.fn(
        async (callback: (tx: typeof transaction) => unknown) =>
          callback(transaction)
      ),
    }
    getDatabaseMock.mockReturnValue({ db })

    await recordSucceededPaymentIntent({
      id: 'pi_payment_sheet',
      customer: 'cus_42',
      created: 1_700_000_000,
      amount_received: 999,
      currency: 'hkd',
      metadata: {
        clippingkkUserId: '42',
        clippingkkPaymentKind: 'premium_payment_sheet',
      },
    } as unknown as Stripe.PaymentIntent)

    expect(insertedOrder).toMatchObject({
      orderId: 'pi_payment_sheet',
      subscriptionId: '',
      stripeCustomerId: 'cus_42',
      amount: 999,
      currency: 'hkd',
      userOrders: 42,
    })
    expect(userChanges?.premiumEndAt).toBeInstanceOf(Date)
  })

  it('ignores unrelated succeeded payment intents', async () => {
    await recordSucceededPaymentIntent({
      metadata: {},
    } as Stripe.PaymentIntent)

    expect(getDatabaseMock).not.toHaveBeenCalled()
  })
})
