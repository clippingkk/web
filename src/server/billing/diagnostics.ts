import { getServerEnv } from '../env'
import { ApiError } from '../errors'
import { subjectForUser } from '../gate/authz'
import { gateConfig } from '../gate/config'
import { appleProductIds } from './apple/verify'
import {
  billingConfig,
  listPlans,
  PREMIUM_PLAN_KEY,
  premiumStates,
  stripeConnection,
} from './gate'

export type BillingCheck = { name: string; ok: boolean; detail: string }

async function check(
  name: string,
  run: () => Promise<string> | string
): Promise<BillingCheck> {
  try {
    return { name, ok: true, detail: await run() }
  } catch (error) {
    const detail =
      error instanceof ApiError
        ? `${error.code}: ${error.message}`
        : error instanceof Error
          ? error.message
          : String(error)
    return { name, ok: false, detail }
  }
}

function fail(message: string): never {
  throw new Error(message)
}

/**
 * Everything Premium depends on, checked one by one so an operator can see
 * which piece is missing. Gate's own error details are in the server logs.
 */
export async function billingDiagnostics(
  userId: number
): Promise<BillingCheck[]> {
  const env = getServerEnv()
  return Promise.all([
    check('gate.config', () => {
      billingConfig()
      return `project ${gateConfig().projectId}, environment ${gateConfig().environmentId}`
    }),
    check('gate.plan', async () => {
      const plan = (await listPlans()).find(
        (candidate) => candidate.key === PREMIUM_PLAN_KEY
      )
      if (!plan) fail(`no "${PREMIUM_PLAN_KEY}" plan in this Gate project`)
      if (!plan.active) fail(`the "${PREMIUM_PLAN_KEY}" plan is inactive`)
      if (!plan.stripePriceId) fail('the plan has no Stripe price')
      if (plan.entitlements.premium !== true)
        fail('the plan must grant { "premium": true } (a boolean)')
      return `price ${plan.stripePriceId}`
    }),
    check('gate.stripe', async () => {
      const connection = await stripeConnection()
      if (!connection) fail('no Stripe connection for this environment')
      return connection.livemode ? 'live mode' : 'test mode'
    }),
    check('gate.premium_state', async () => {
      const subject = await subjectForUser(userId)
      if (!subject) fail('your account is not linked to Gate')
      const [end] = await premiumStates([subject])
      return end ? `your Premium ends ${end}` : 'reachable; you are Free'
    }),
    check('apple.config', () => {
      const products = [...appleProductIds()]
      if (!products.length) fail('APPLE_IAP_PRODUCT_IDS is empty')
      if (!env.APPLE_IAP_APP_APPLE_ID)
        fail('APPLE_IAP_APP_APPLE_ID is empty: production purchases fail')
      return [
        `bundle ${env.APPLE_IAP_BUNDLE_ID}`,
        `products ${products.join(', ')}`,
        `sandbox ${env.APPLE_IAP_ALLOW_SANDBOX === '1' ? 'accepted' : 'refused'}`,
      ].join('; ')
    }),
  ])
}
