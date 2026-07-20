import { ApiError } from '@/server/errors'
import { errorJson, json } from '@/server/http'

describe('HTTP response helpers', () => {
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
    })
  })
})
