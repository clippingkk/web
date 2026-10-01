import { z } from 'zod'

import { requireUserId } from '../../auth'
import { ApiError } from '../../errors'
import { boundedJson, json } from '../../http'
import { rateLimit } from '../../redis'
import { billingState } from '../state'
import { applyAppleUpdate, ownerOf } from './sync'
import {
  verifyNotification,
  verifyRenewalInfo,
  verifyTransaction,
} from './verify'

// A signed transaction carries its certificate chain (~6 KB); a notification
// nests a transaction and renewal info inside another signed payload.
const TRANSACTION_LIMIT = 32 * 1024
const NOTIFICATION_LIMIT = 64 * 1024

const transactionBody = z
  .object({
    signedTransaction: z.string().min(1),
    signedRenewalInfo: z.string().min(1).optional(),
  })
  .strict()

/**
 * The iOS app reports a verified StoreKit transaction. Returns the reader's
 * billing state so the app can unlock Premium at once; only then does it
 * finish the transaction.
 */
export async function submitAppleTransaction(request: Request) {
  const userId = await requireUserId(request)
  const { signedTransaction, signedRenewalInfo } = await boundedJson(
    request,
    transactionBody,
    TRANSACTION_LIMIT
  )
  const [transaction, renewal] = await Promise.all([
    verifyTransaction(signedTransaction),
    signedRenewalInfo ? verifyRenewalInfo(signedRenewalInfo) : null,
  ])
  await applyAppleUpdate(userId, { transaction, renewal })
  const response = json(await billingState(userId))
  response.headers.set('Cache-Control', 'no-store')
  return response
}

const notificationBody = z.object({ signedPayload: z.string().min(1) })

/**
 * App Store Server Notifications V2. Every notification type carries the
 * subscription's current transaction and renewal info, so each one is
 * applied the same way. Answers 200 to anything Apple should not resend and
 * 5xx when a retry could succeed.
 */
export async function receiveAppleNotification(request: Request) {
  if (!(await rateLimit('ck:apple:notifications', 600, 60)).allowed)
    throw new ApiError('Too many notifications. Retry shortly.', 429)
  const { signedPayload } = await boundedJson(
    request,
    notificationBody,
    NOTIFICATION_LIMIT
  )
  const ack = (outcome: string) => json({ received: true, outcome })
  try {
    const notification = await verifyNotification(signedPayload)
    const data = notification.data
    if (!data?.signedTransactionInfo) return ack('ignored')
    const [transaction, renewal] = await Promise.all([
      verifyTransaction(data.signedTransactionInfo),
      data.signedRenewalInfo ? verifyRenewalInfo(data.signedRenewalInfo) : null,
    ])
    const userId = await ownerOf(transaction)
    if (!userId) {
      console.warn('billing: App Store notification for no known reader', {
        type: notification.notificationType,
        originalTransactionId: transaction.originalTransactionId,
      })
      return ack('unknown_reader')
    }
    await applyAppleUpdate(userId, { transaction, renewal })
    return ack('applied')
  } catch (error) {
    // Retrying cannot fix a bad signature, a foreign product or an ownership
    // conflict; it can fix an Apple or Gate outage.
    if (error instanceof ApiError && error.status < 500) {
      console.error('billing: App Store notification rejected', error.code)
      return ack('rejected')
    }
    throw error
  }
}
