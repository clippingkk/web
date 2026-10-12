import { resetServerEnvForTests } from '@/server/env'
import { ApiError } from '@/server/errors'
import { boundedText, errorJson, json, route } from '@/server/http'

const { connection } = vi.hoisted(() => ({
  connection: vi.fn<() => Promise<void>>(),
}))

vi.mock('next/server', () => ({ connection }))

beforeEach(() => {
  connection.mockResolvedValue()
  process.env.DATABASE_URL =
    'postgresql://postgres:admin@localhost:5432/clippingkk_test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.APP_ORIGIN = 'https://clippingkk.example'
  resetServerEnvForTests()
})

describe('HTTP response helpers', () => {
  it('defers route handlers to request time before executing them', async () => {
    const handler = route(async () => {
      expect(connection).toHaveBeenCalledOnce()
      return json({ ok: true })
    })

    const response = await handler(
      new Request('https://clippingkk.example/api/v2/config')
    )

    expect(response.status).toBe(200)
  })

  it('builds the shared success envelope', async () => {
    const response = json({ ok: true }, 201, 'created')

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      status: 201,
      msg: 'created',
      data: { ok: true },
    })
  })

  it('builds the shared error envelope', async () => {
    const response = errorJson(new ApiError('not allowed', 403))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      status: 403,
      msg: 'not allowed',
      error: 'not allowed',
      code: 'FORBIDDEN',
    })
  })

  it('adds CORS headers to immutable redirect responses', async () => {
    const handler = route(async () =>
      Response.redirect('https://clippingkk.example/auth/signin', 307)
    )

    const response = await handler(
      new Request('https://clippingkk.example/api/v2/auth/verify')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://clippingkk.example/auth/signin'
    )
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'https://clippingkk.example'
    )
  })
})

describe('boundedText', () => {
  const chunked = (parts: string[]) =>
    new Request('https://clippingkk.example/api/v3/inbound/resend', {
      method: 'POST',
      body: new ReadableStream({
        start(controller) {
          for (const part of parts)
            controller.enqueue(new TextEncoder().encode(part))
          controller.close()
        },
      }),
      duplex: 'half',
    } as RequestInit)

  it('returns the raw body exactly as sent', async () => {
    const payload = '{"type":"email.received", "data":{"subject":"经略幽燕"}}'
    await expect(boundedText(chunked([payload]), 1024)).resolves.toBe(payload)
  })

  it('refuses a chunked body over the limit', async () => {
    await expect(
      boundedText(chunked(['a'.repeat(600), 'b'.repeat(600)]), 1024)
    ).rejects.toMatchObject({ status: 413 })
  })
})
