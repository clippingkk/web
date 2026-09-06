import { randomUUID } from 'node:crypto'

import type {
  CreateCheckoutSessionResponse,
  GetSubjectCheckoutResponse,
  ListBillingPlansResponse,
} from '@/gate/generated/types.gen'

import { requireSubject } from './authz'
import { gateRequest, projectPath } from './client'
import { gateConfig } from './config'
export async function createCheckout(
  userId: number,
  idempotencyKey: string = randomUUID()
) {
  const subjectId = await requireSubject(userId),
    config = gateConfig()
  return gateRequest<CreateCheckoutSessionResponse['data']>(
    `${projectPath()}/billing/checkout`,
    {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({
        subjectId,
        environmentId: config.environmentId,
        planKey: 'premium',
        successUrl: `${config.appOrigin}/payment/success?sessionId={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${config.appOrigin}/payment/canceled`,
      }),
    }
  )
}
export async function subjectBillingPath(userId: number) {
  return `${projectPath()}/subjects/${encodeURIComponent(await requireSubject(userId))}/billing`
}
export async function checkoutStatus(userId: number, sessionId: string) {
  return gateRequest<GetSubjectCheckoutResponse['data']>(
    `${await subjectBillingPath(userId)}/checkout/${encodeURIComponent(sessionId)}?environmentId=${encodeURIComponent(gateConfig().environmentId)}`
  )
}

export async function listPlans() {
  return gateRequest<ListBillingPlansResponse['data']>(
    `${projectPath()}/billing/plans`
  )
}
