import type Stripe from 'stripe'

import { requireEnv } from '@/server/env'
import { ApiError } from '@/server/errors'
import { json, route } from '@/server/http'
import { getStripe } from '@/server/integrations'
import {
  recordPaidInvoice,
  recordSucceededPaymentIntent,
} from '@/server/payments'

export const POST = route(async (request) => {
  const signature = request.headers.get('stripe-signature')
  if (!signature) throw new ApiError('Stripe-Signature required')
  const payload = await request.text()
  let event: Stripe.Event
  try {
    event = await getStripe().webhooks.constructEventAsync(
      payload,
      signature,
      requireEnv('STRIPE_WEBHOOK_ENDPOINT_SECRET')
    )
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'invalid Stripe signature'
    )
  }
  if (event.type === 'invoice.paid') await recordPaidInvoice(event.data.object)
  if (event.type === 'payment_intent.succeeded')
    await recordSucceededPaymentIntent(event.data.object)
  return json({ received: true, type: event.type })
})
