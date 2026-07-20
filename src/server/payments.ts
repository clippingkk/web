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
      metadata: { clippingkkUserId: String(user.id) },
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

function customerId(value: Stripe.Invoice['customer']) {
  if (!value) return ''
  return typeof value === 'string' ? value : value.id
}

export async function recordPaidInvoice(invoice: Stripe.Invoice) {
  const stripeCustomerId = customerId(invoice.customer)
  if (!stripeCustomerId)
    throw new ApiError('customer of the order not found', 500)
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.stripeCustomerId, stripeCustomerId),
  })
  if (!user) throw new ApiError('customer of the order not found', 404)
  const exists = await getDatabase().db.query.orders.findFirst({
    where: and(eq(orders.orderId, invoice.id), eq(orders.userOrders, user.id)),
  })
  if (exists) return exists

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
  const now = new Date()
  const baseline =
    user.premiumEndAt && user.premiumEndAt > now ? user.premiumEndAt : now
  return getDatabase().db.transaction(async (transaction) => {
    const [order] = await transaction
      .insert(orders)
      .values({
        orderId: invoice.id,
        sku: 'premium',
        subscriptionId,
        stripeCustomerId,
        orderCreatedAt: new Date(invoice.created * 1000),
        amount: invoice.amount_paid,
        currency: invoice.currency,
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
