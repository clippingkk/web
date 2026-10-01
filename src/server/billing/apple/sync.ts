import { AutoRenewStatus } from '@apple/app-store-server-library'
import { and, eq, isNull } from 'drizzle-orm'

import { getDatabase } from '../../db'
import {
  appleSubscriptions,
  users,
  type AppleSubscription,
} from '../../db/schema'
import { ApiError } from '../../errors'
import { upsertAppleGrant } from '../gate'
import { appleAccessEnd } from '../state'
import type { AppleRenewalInfo, AppleTransaction } from './verify'

type Changes = Partial<
  Omit<AppleSubscription, 'originalTransactionId' | 'userId' | 'createdAt'>
>

const at = (ms: number | undefined) => (ms === undefined ? null : new Date(ms))

function otherAccount() {
  return new ApiError(
    'This App Store subscription belongs to another ClippingKK account.',
    409,
    'APPLE_TRANSACTION_OTHER_ACCOUNT'
  )
}

/**
 * How a verified transaction changes the stored subscription, or null when it
 * changes nothing. Apple delivers the same facts through the device and
 * through notifications, in any order, so:
 *
 * - a transaction replaced by an upgrade is ignored (Apple marks it revoked,
 *   but the reader keeps access through the new one);
 * - a newer signature of the latest transaction wins (refunds and their
 *   reversals arrive this way);
 * - a different transaction only replaces the latest when it runs later, so
 *   an old renewal, or a refund of one, never cuts the current period short.
 */
export function transactionChanges(
  row: AppleSubscription,
  transaction: AppleTransaction
): Changes | null {
  if (transaction.isUpgraded) return null
  const signedAt = new Date(transaction.signedDate!)
  const expiresAt = new Date(transaction.expiresDate!)
  const facts = {
    productId: transaction.productId!,
    expiresAt,
    revokedAt: at(transaction.revocationDate),
    transactionSignedAt: signedAt,
  }
  if (transaction.transactionId === row.latestTransactionId)
    return signedAt > row.transactionSignedAt ? facts : null
  if (expiresAt > row.expiresAt)
    return { ...facts, latestTransactionId: transaction.transactionId! }
  return null
}

/** How newer renewal info changes the subscription, or null. */
export function renewalChanges(
  row: Pick<AppleSubscription, 'renewalSignedAt'>,
  renewal: AppleRenewalInfo
): Changes | null {
  if (!renewal.signedDate) return null
  const signedAt = new Date(renewal.signedDate)
  if (row.renewalSignedAt && signedAt <= row.renewalSignedAt) return null
  return {
    autoRenew: renewal.autoRenewStatus === AutoRenewStatus.ON,
    gracePeriodExpiresAt: at(renewal.gracePeriodExpiresDate),
    renewalSignedAt: signedAt,
  }
}

/** The latest moment any of these subscriptions grants access, if still ahead. */
export function appleGrantEnd(
  rows: readonly AppleSubscription[],
  now = new Date()
): Date | null {
  let end: Date | null = null
  for (const row of rows) {
    const rowEnd = appleAccessEnd(row)
    if (rowEnd && (!end || rowEnd > end)) end = rowEnd
  }
  return end && end > now ? end : null
}

export type AppleUpdate = {
  transaction: AppleTransaction
  renewal?: AppleRenewalInfo | null
}

/**
 * Records a verified App Store transaction (and renewal info) for `userId`
 * and refreshes their Gate grant, all while holding the reader's row lock.
 * If Gate refuses, nothing is stored and the caller retries.
 */
export async function applyAppleUpdate(
  userId: number,
  { transaction, renewal }: AppleUpdate
) {
  await getDatabase().db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .for('update')
    if (!user) throw new ApiError('Sign in again', 401, 'UNAUTHORIZED')
    const token = transaction.appAccountToken?.toLowerCase()
    // Purchases made in the app carry the buyer's token. One without a token
    // (an offer code, a purchase made outside the app) goes to whoever claims
    // it first; after that the stored owner decides.
    if (token && token !== user.appAccountToken?.toLowerCase())
      throw otherAccount()

    const id = transaction.originalTransactionId!
    if (!transaction.isUpgraded) {
      const [inserted] = await tx
        .insert(appleSubscriptions)
        .values({
          originalTransactionId: id,
          userId,
          productId: transaction.productId!,
          environment: String(transaction.environment),
          latestTransactionId: transaction.transactionId!,
          appAccountToken: token ?? null,
          expiresAt: new Date(transaction.expiresDate!),
          revokedAt: at(transaction.revocationDate),
          transactionSignedAt: new Date(transaction.signedDate!),
        })
        .onConflictDoNothing()
        .returning()
      const [row] = inserted
        ? [inserted]
        : await tx
            .select()
            .from(appleSubscriptions)
            .where(eq(appleSubscriptions.originalTransactionId, id))
            .for('update')
      if (row.userId !== userId) throw otherAccount()
      const changes = {
        ...(inserted ? null : transactionChanges(row, transaction)),
        ...(renewal && renewal.originalTransactionId === id
          ? renewalChanges(row, renewal)
          : null),
      }
      if (Object.keys(changes).length)
        await tx
          .update(appleSubscriptions)
          .set({ ...changes, updatedAt: new Date() })
          .where(eq(appleSubscriptions.originalTransactionId, id))
    }

    if (!user.gateUserId) {
      console.error(
        'billing: App Store purchase for a user not linked to Gate',
        {
          userId,
        }
      )
      return
    }
    const rows = await tx
      .select()
      .from(appleSubscriptions)
      .where(eq(appleSubscriptions.userId, userId))
    await upsertAppleGrant(user.gateUserId, appleGrantEnd(rows))
  })
}

/**
 * Who an App Store Server Notification is about: the reader who already owns
 * the subscription, or the one whose `appAccountToken` the purchase carries.
 */
export async function ownerOf(transaction: AppleTransaction) {
  const { db } = getDatabase()
  const row = await db.query.appleSubscriptions.findFirst({
    where: eq(
      appleSubscriptions.originalTransactionId,
      transaction.originalTransactionId!
    ),
    columns: { userId: true },
  })
  if (row) return row.userId
  const token = transaction.appAccountToken?.toLowerCase()
  if (!token) return null
  const user = await db.query.users.findFirst({
    where: and(eq(users.appAccountToken, token), isNull(users.deletedAt)),
    columns: { id: true },
  })
  return user?.id ?? null
}
