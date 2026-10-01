import { randomUUID } from 'node:crypto'

import type {
  CancelSubjectSubscriptionResponse,
  CreateCheckoutSessionResponse,
  CreateSubjectBillingPortalResponse,
  GetStripeConnectionResponse,
  GetSubjectBillingResponse,
  GetSubjectCheckoutResponse,
  GetSubjectsPremiumStateResponse,
  ListBillingPlansResponse,
  UpsertEntitlementGrantResponse,
} from '@/gate/generated/types.gen'

import { ApiError } from '../errors'
import { requireSubject } from '../gate/authz'
import { gateRequest, projectPath } from '../gate/client'
import { gateConfig } from '../gate/config'

/** The Gate plan ClippingKK sells through Stripe. */
export const PREMIUM_PLAN_KEY = 'premium'
/** One App Store grant per subject; Apple subscriptions are folded into it. */
export const APPLE_GRANT_REFERENCE = 'clippingkk:apple'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Gate config every billing call needs. An empty or malformed environment id
 * used to reach Gate as `?environmentId=` and fail as "everyone is Free".
 */
export function billingConfig() {
  const config = gateConfig()
  if (!config.apiKey || !config.projectId || !UUID.test(config.environmentId)) {
    console.error(
      'billing: GATE_API_KEY, GATE_PROJECT_ID and a UUID GATE_ENVIRONMENT_ID are required'
    )
    throw new ApiError('Billing is not configured.', 503, 'GATE_NOT_CONFIGURED')
  }
  return config
}

const environmentQuery = () =>
  `environmentId=${encodeURIComponent(billingConfig().environmentId)}`

async function subjectPath(userId: number) {
  return `${projectPath()}/subjects/${encodeURIComponent(await requireSubject(userId))}`
}

export type GateSubjectBilling = GetSubjectBillingResponse['data']

export async function subjectBilling(userId: number) {
  return gateRequest<GateSubjectBilling>(
    `${await subjectPath(userId)}/billing?${environmentQuery()}`
  )
}

/** Premium end dates for up to 100 Gate subjects, in the order given. */
export async function premiumStates(subjects: readonly string[]) {
  const rows = await gateRequest<GetSubjectsPremiumStateResponse['data']>(
    `${projectPath()}/billing/subjects/state`,
    {
      method: 'POST',
      body: JSON.stringify({
        environmentId: billingConfig().environmentId,
        subjectIds: subjects,
      }),
    }
  )
  const ends = new Map(rows.map((row) => [row.subjectId, row.premiumEndAt]))
  return subjects.map((subject) => ends.get(subject) ?? null)
}

export async function createCheckout(
  userId: number,
  idempotencyKey: string = randomUUID()
) {
  const config = billingConfig()
  return gateRequest<CreateCheckoutSessionResponse['data']>(
    `${projectPath()}/billing/checkout`,
    {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({
        subjectId: await requireSubject(userId),
        environmentId: config.environmentId,
        planKey: PREMIUM_PLAN_KEY,
        successUrl: `${config.appOrigin}/payment/success?sessionId={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${config.appOrigin}/payment/canceled`,
      }),
    }
  )
}

export async function checkoutStatus(userId: number, sessionId: string) {
  return gateRequest<GetSubjectCheckoutResponse['data']>(
    `${await subjectPath(userId)}/billing/checkout/${encodeURIComponent(sessionId)}?${environmentQuery()}`
  )
}

export async function billingPortal(userId: number, returnPath = '/pricing') {
  const config = billingConfig()
  return gateRequest<CreateSubjectBillingPortalResponse['data']>(
    `${await subjectPath(userId)}/billing/portal`,
    {
      method: 'POST',
      body: JSON.stringify({
        environmentId: config.environmentId,
        returnUrl: `${config.appOrigin}${returnPath}`,
      }),
    }
  )
}

export async function cancelSubscription(
  userId: number,
  subscriptionId: string
) {
  return gateRequest<CancelSubjectSubscriptionResponse['data']>(
    `${await subjectPath(userId)}/billing/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({
        subscriptionId,
        environmentId: billingConfig().environmentId,
      }),
    }
  )
}

export async function listPlans() {
  return gateRequest<ListBillingPlansResponse['data']>(
    `${projectPath()}/billing/plans`
  )
}

export async function stripeConnection() {
  return gateRequest<GetStripeConnectionResponse['data']>(
    `/environments/${encodeURIComponent(billingConfig().environmentId)}/stripe-connection`
  )
}

/**
 * Records App Store access for a Gate subject. `end` null ends it: Gate
 * ignores a grant whose `expiresAt` has passed, and the subject's Stripe
 * subscription (if any) decides alone.
 */
export async function upsertAppleGrant(subject: string, end: Date | null) {
  billingConfig()
  return gateRequest<UpsertEntitlementGrantResponse['data']>(
    `${projectPath()}/subjects/${encodeURIComponent(subject)}/entitlement-grants`,
    {
      method: 'POST',
      body: JSON.stringify({
        feature: 'premium',
        value: true,
        source: 'apple_iap',
        sourceReference: APPLE_GRANT_REFERENCE,
        expiresAt: (end ?? new Date()).toISOString(),
      }),
    }
  )
}
