import { subjectForUser } from '../gate/authz'
import { premiumStates } from './gate'

/**
 * When the user's Premium ends, as Gate resolves it from their Stripe
 * subscription and App Store grant. Null when they have none or are not linked
 * to Gate. Throws (503) when Gate cannot answer: callers that gate a feature
 * must not mistake an outage for "Free".
 */
export async function premiumEndAt(userId: number): Promise<Date | null> {
  const subject = await subjectForUser(userId)
  if (!subject) return null
  const [end] = await premiumStates([subject])
  return end ? new Date(end) : null
}

/** The one Premium check: display, enforcement and checkout all use it. */
export async function isPremium(userId: number): Promise<boolean> {
  const end = await premiumEndAt(userId)
  return !!end && end.getTime() > Date.now()
}
