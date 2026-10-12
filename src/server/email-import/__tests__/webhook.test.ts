// @vitest-environment node
import { createHmac, randomBytes } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { enqueueEmailImport } = vi.hoisted(() => ({
  enqueueEmailImport: vi.fn(async () => ({})),
}))
vi.mock('../../jobs/queues', () => ({ enqueueEmailImport }))

import { resetServerEnvForTests } from '../../env'
import { receiveResendWebhook } from '../webhook'

const secretBytes = randomBytes(24)
const SECRET = `whsec_${secretBytes.toString('base64')}`

const received = {
  type: 'email.received',
  created_at: '2026-10-12T08:00:00.000Z',
  data: {
    email_id: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c',
    created_at: '2026-10-12T08:00:00.000Z',
    from: 'Reader <reader@icloud.com>',
    to: ['kindle@import.clippingkk.example'],
    bcc: [],
    cc: [],
    received_for: ['kindle@import.clippingkk.example'],
    message_id: '<message@icloud.com>',
    subject:
      'iPhone Notebook export for 经略幽燕：宋辽战争军事灾难的战略分析 (曾瑞龙)',
    attachments: [
      {
        id: '2a0c9ce0-3112-4728-976e-47ddcd16a318',
        filename: 'Notebook.html',
        content_type: 'text/html',
        content_disposition: 'attachment',
        content_id: null,
      },
    ],
  },
}

/** A delivery signed the way Resend (Svix / Standard Webhooks) signs one. */
function delivery(
  event: unknown,
  { secret = secretBytes, timestamp = Math.floor(Date.now() / 1000) } = {}
) {
  const payload = JSON.stringify(event)
  const id = 'msg_2mF3xQb'
  const signature = createHmac('sha256', secret)
    .update(`${id}.${timestamp}.${payload}`)
    .digest('base64')
  return new Request('https://clippingkk.example/api/v3/inbound/resend', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'svix-id': id,
      'svix-timestamp': String(timestamp),
      'svix-signature': `v1,${signature}`,
    },
    body: payload,
  })
}

beforeEach(() => {
  process.env.DATABASE_URL = 'postgresql://postgres:admin@localhost:5432/test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.RESEND_API_KEY = 're_test'
  process.env.RESEND_WEBHOOK_SECRET = SECRET
  process.env.INBOUND_EMAIL_ADDRESS = 'kindle@import.clippingkk.example'
  resetServerEnvForTests()
  enqueueEmailImport.mockClear()
})

describe('receiveResendWebhook', () => {
  it('queues a received email once its signature checks out', async () => {
    const response = await receiveResendWebhook(delivery(received))

    expect(await response.json()).toMatchObject({
      data: { received: true, outcome: 'queued' },
    })
    expect(enqueueEmailImport).toHaveBeenCalledWith({
      emailId: received.data.email_id,
      from: 'Reader <reader@icloud.com>',
      to: ['kindle@import.clippingkk.example'],
      receivedFor: ['kindle@import.clippingkk.example'],
      subject: received.data.subject,
      receivedAt: '2026-10-12T08:00:00.000Z',
    })
  })

  it('refuses a delivery signed with another secret', async () => {
    await expect(
      receiveResendWebhook(delivery(received, { secret: randomBytes(24) }))
    ).rejects.toMatchObject({ status: 401 })
    expect(enqueueEmailImport).not.toHaveBeenCalled()
  })

  it('refuses a replayed delivery', async () => {
    const stale = Math.floor(Date.now() / 1000) - 60 * 60
    await expect(
      receiveResendWebhook(delivery(received, { timestamp: stale }))
    ).rejects.toMatchObject({ status: 401 })
  })

  it('acknowledges events other than received mail without queueing', async () => {
    const response = await receiveResendWebhook(
      delivery({ type: 'email.delivered', created_at: '', data: {} })
    )

    expect(await response.json()).toMatchObject({
      data: { outcome: 'ignored' },
    })
    expect(enqueueEmailImport).not.toHaveBeenCalled()
  })

  it.each(['RESEND_WEBHOOK_SECRET', 'INBOUND_EMAIL_ADDRESS'])(
    'answers 503 until %s is configured',
    async (name) => {
      process.env[name] = ''
      resetServerEnvForTests()

      await expect(
        receiveResendWebhook(delivery(received))
      ).rejects.toMatchObject({ status: 503 })
      expect(enqueueEmailImport).not.toHaveBeenCalled()
    }
  )
})
