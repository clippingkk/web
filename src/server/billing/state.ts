import { randomUUID } from 'node:crypto'

import { and, desc, eq, isNull } from 'drizzle-orm'

import { getDatabase } from '../db'
import { appleSubscriptions, users, type AppleSubscription } from '../db/schema'
import { ApiError } from '../errors'
import { subjectBilling } from './gate'

export type BillingProvider = 'stripe' | 'apple'

export type BillingSubscription = {
  id: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  provider: BillingProvider
  /** The App Store product, for Apple subscriptions. */
  productId: string | null
}

/**
 * What `/api/billing/subscriptions` returns. `premiumEndAt` and the Stripe
 * subscriptions come from Gate; Apple subscriptions from our own records.
 * Older iOS builds read only `premiumEndAt` and the first four subscription
 * fields, so new fields are additive.
 */
export type BillingState = {
  premiumEndAt: string | null
  /** Passed to StoreKit so App Store purchases come back tied to this account. */
  appAccountToken: string
  subscriptions: BillingSubscription[]
}

/** The reader's StoreKit `appAccountToken`, created on first use. */
export async function ensureAppAccountToken(userId: number): Promise<string> {
  const { db } = getDatabase()
  const current = async () =>
    (
      await db.query.users.findFirst({
        where: and(eq(users.id, userId), isNull(users.deletedAt)),
        columns: { appAccountToken: true },
      })
    )?.appAccountToken
  const existing = await current()
  if (existing) return existing
  // Only fills an empty column, so two first requests agree on one token.
  await db
    .update(users)
    .set({ appAccountToken: randomUUID() })
    .where(and(eq(users.id, userId), isNull(users.appAccountToken)))
  const token = await current()
  if (!token) throw new ApiError('Sign in again', 401, 'UNAUTHORIZED')
  return token
}

/** When this App Store subscription's access ends, or null once revoked. */
export function appleAccessEnd(row: AppleSubscription): Date | null {
  if (row.revokedAt) return null
  const grace = row.gracePeriodExpiresAt
  return grace && grace > row.expiresAt ? grace : row.expiresAt
}

function appleStatus(row: AppleSubscription, now: Date) {
  const end = appleAccessEnd(row)
  if (!end || end <= now) return 'canceled'
  return row.expiresAt <= now ? 'past_due' : 'active'
}

export function appleSubscriptionView(
  row: AppleSubscription,
  now = new Date()
): BillingSubscription {
  return {
    id: row.originalTransactionId,
    status: appleStatus(row, now),
    currentPeriodEnd: (appleAccessEnd(row) ?? row.expiresAt).toISOString(),
    cancelAtPeriodEnd: !row.autoRenew,
    provider: 'apple',
    productId: row.productId,
  }
}

export async function appleSubscriptionsFor(userId: number) {
  return getDatabase()
    .db.select()
    .from(appleSubscriptions)
    .where(eq(appleSubscriptions.userId, userId))
    .orderBy(desc(appleSubscriptions.expiresAt))
}

export async function billingState(userId: number): Promise<BillingState> {
  const [gate, apple, appAccountToken] = await Promise.all([
    subjectBilling(userId),
    appleSubscriptionsFor(userId),
    ensureAppAccountToken(userId),
  ])
  const now = new Date()
  return {
    premiumEndAt: gate.premiumEndAt,
    appAccountToken,
    subscriptions: [
      ...apple.map((row) => appleSubscriptionView(row, now)),
      ...gate.subscriptions.map((subscription) => ({
        ...subscription,
        provider: 'stripe' as const,
        productId: null,
      })),
    ],
  }
}

const LIVE = new Set(['active', 'trialing', 'past_due'])

/**
 * Who bills the reader right now, which decides where they manage it: the App
 * Store, Stripe's portal, or nowhere (a manual grant, or Free).
 */
export function activeProvider(state: BillingState): BillingProvider | null {
  const live = state.subscriptions.filter((subscription) =>
    LIVE.has(subscription.status)
  )
  if (live.some((subscription) => subscription.provider === 'apple'))
    return 'apple'
  if (live.some((subscription) => subscription.provider === 'stripe'))
    return 'stripe'
  return null
}
