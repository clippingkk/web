import { and, eq } from 'drizzle-orm'
import type Stripe from 'stripe'

import { getDatabase } from './db'
import { orders, users, type User } from './db/schema'
import { ApiError } from './errors'
import { getStripe } from './integrations'

export async function ensureStripeCustomer(user: User) {
  if (user.stripeCustomerId) return user.stripeCustomerId
  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    phone: user.phone || undefined,
    metadata: { clippingkkUserId: String(user.id) },
  })
  await getDatabase()
    .db.update(users)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(users.id, user.id))
  return customer.id
}

export async function createPaymentSheet(user: User) {
  const stripe = getStripe()
  const customer = await ensureStripeCustomer(user)
  const [ephemeralKey, paymentIntent] = await Promise.all([
    stripe.ephemeralKeys.create({ customer }),
    stripe.paymentIntents.create({
      amount: 999,
      currency: 'hkd',
      customer,
      automatic_payment_methods: { enabled: true },
      metadata: {
        clippingkkUserId: String(user.id),
        clippingkkPaymentKind: 'premium_payment_sheet',
      },
    }),
  ])
  return {
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer,
  }
}

export async function createSubscriptionCheckout(
  user: User,
  priceId: string,
  appOrigin: string
) {
  const customer = await ensureStripeCustomer(user)
  return getStripe().checkout.sessions.create({
    success_url: `${appOrigin}/payment/success?sessionId={CHECKOUT_SESSION_ID}&uid=${user.id}`,
    cancel_url: `${appOrigin}/payment/canceled?uid=${user.id}`,
    customer,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { clippingkkUserId: String(user.id) },
  })
}

function customerId(value: string | { id: string } | null) {
  if (!value) return ''
  return typeof value === 'string' ? value : value.id
}

type PremiumPayment = {
  orderId: string
  subscriptionId: string
  stripeCustomerId: string
  orderCreatedAt: Date
  amount: number
  currency: string
  expectedUserId?: number
}

async function recordPremiumPayment(payment: PremiumPayment) {
  const { stripeCustomerId } = payment
  if (!stripeCustomerId)
    throw new ApiError('customer of the order not found', 500)
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.stripeCustomerId, stripeCustomerId),
  })
  if (!user) throw new ApiError('customer of the order not found', 404)
  if (payment.expectedUserId && payment.expectedUserId !== user.id) {
    throw new ApiError('payment customer does not match its user', 400)
  }
  const exists = await getDatabase().db.query.orders.findFirst({
    where: and(
      eq(orders.orderId, payment.orderId),
      eq(orders.userOrders, user.id)
    ),
  })
  if (exists) return exists
  const now = new Date()
  const baseline =
    user.premiumEndAt && user.premiumEndAt > now ? user.premiumEndAt : now
  return getDatabase().db.transaction(async (transaction) => {
    const [order] = await transaction
      .insert(orders)
      .values({
        orderId: payment.orderId,
        sku: 'premium',
        subscriptionId: payment.subscriptionId,
        stripeCustomerId,
        orderCreatedAt: payment.orderCreatedAt,
        amount: payment.amount,
        currency: payment.currency,
        userOrders: user.id,
      })
      .returning()
    await transaction
      .update(users)
      .set({
        premiumEndAt: new Date(baseline.getTime() + 31 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
    return order
  })
}

export async function recordPaidInvoice(invoice: Stripe.Invoice) {
  const raw = invoice as unknown as {
    subscription?: string | { id: string } | null
    parent?: {
      subscription_details?: { subscription?: string | { id: string } | null }
    }
  }
  const subscription =
    raw.subscription ?? raw.parent?.subscription_details?.subscription
  const subscriptionId =
    typeof subscription === 'string' ? subscription : (subscription?.id ?? '')
  return recordPremiumPayment({
    orderId: invoice.id,
    subscriptionId,
    stripeCustomerId: customerId(invoice.customer),
    orderCreatedAt: new Date(invoice.created * 1000),
    amount: invoice.amount_paid,
    currency: invoice.currency,
  })
}

export async function recordSucceededPaymentIntent(
  paymentIntent: Stripe.PaymentIntent
) {
  if (
    paymentIntent.metadata.clippingkkPaymentKind !== 'premium_payment_sheet'
  ) {
    return
  }
  const expectedUserId = Number.parseInt(
    paymentIntent.metadata.clippingkkUserId ?? '',
    10
  )
  if (!Number.isInteger(expectedUserId) || expectedUserId <= 0) {
    throw new ApiError('payment user metadata is invalid', 400)
  }
  return recordPremiumPayment({
    orderId: paymentIntent.id,
    subscriptionId: '',
    stripeCustomerId: customerId(paymentIntent.customer),
    orderCreatedAt: new Date(paymentIntent.created * 1000),
    amount: paymentIntent.amount_received,
    currency: paymentIntent.currency,
    expectedUserId,
  })
}
