import { z } from 'zod'

import { getServerEnv } from '../env'
import { ApiError } from '../errors'
import { boundedText, json } from '../http'
import { getResend } from '../integrations'
import { enqueueEmailImport } from '../jobs/queues'

/**
 * Resend's webhook for inbound mail (event `email.received`). It only carries
 * the envelope; the importer fetches the attachments later, so this verifies
 * the signature, queues the email and answers before Resend's timeout. A
 * failure to queue answers 5xx, and Resend redelivers.
 */

const MAX_BODY_BYTES = 256 * 1024

const receivedSchema = z.object({
  type: z.literal('email.received'),
  data: z.object({
    email_id: z.string().min(1).max(128),
    created_at: z.string(),
    from: z.string().max(1024),
    to: z.array(z.string()).default([]),
    received_for: z.array(z.string()).default([]),
    subject: z.string().default(''),
  }),
})

function signatureHeader(request: Request, name: string) {
  return (
    request.headers.get(`svix-${name}`) ??
    request.headers.get(`webhook-${name}`) ??
    ''
  )
}

export async function receiveResendWebhook(request: Request) {
  const env = getServerEnv()
  if (!env.RESEND_API_KEY || !env.RESEND_WEBHOOK_SECRET)
    throw new ApiError('Email import is not configured.', 503)
  const payload = await boundedText(request, MAX_BODY_BYTES)

  let event: unknown
  try {
    event = getResend().webhooks.verify({
      payload,
      headers: {
        id: signatureHeader(request, 'id'),
        timestamp: signatureHeader(request, 'timestamp'),
        signature: signatureHeader(request, 'signature'),
      },
      webhookSecret: env.RESEND_WEBHOOK_SECRET,
    })
  } catch {
    throw new ApiError('Invalid webhook signature.', 401)
  }

  if ((event as { type?: unknown }).type !== 'email.received')
    return json({ received: true, outcome: 'ignored' })
  const parsed = receivedSchema.safeParse(event)
  if (!parsed.success) {
    // Signed by Resend but not a shape we read; a retry would not change it.
    console.warn('email-import: unreadable email.received event')
    return json({ received: true, outcome: 'rejected' })
  }

  const { data } = parsed.data
  await enqueueEmailImport({
    emailId: data.email_id,
    from: data.from,
    to: data.to,
    receivedFor: data.received_for,
    subject: data.subject,
    receivedAt: data.created_at,
  })
  return json({ received: true, outcome: 'queued' })
}
