import { CombinedGraphQLErrors } from '@apollo/client'
import toast from 'react-hot-toast'

import {
  isUnauthorizedApolloError,
  request,
  requestJson,
  updateToken,
} from '@/services/ajax'

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}))

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('HTTP client helpers', () => {
  beforeEach(() => {
    updateToken('')
    vi.mocked(toast.error).mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('supports requests without initial headers and unwraps data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        status: 200,
        msg: '',
        data: { uid: 42 },
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(request<{ uid: number }>('/v2/example')).resolves.toEqual({
      uid: 42,
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v2/example')
    expect(new Headers(init.headers).get('X-Accept-Language')).toBe('en')
    expect(init.credentials).toBe('include')
    expect(init.mode).toBe('cors')
  })

  it('serializes JSON bodies and preserves caller headers', async () => {
    updateToken('local-token')
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        status: 200,
        msg: '',
        data: { checkoutUrl: 'https://checkout.example' },
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await requestJson<{ checkoutUrl: string }, { priceId: string }>(
      '/v2/payment-subscription',
      'POST',
      { priceId: 'price_123' },
      { headers: { Authorization: 'Bearer explicit-token' } }
    )

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(init.headers)
    expect(headers.get('Authorization')).toBe('Bearer explicit-token')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({ priceId: 'price_123' }))
  })

  it('rejects error envelopes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        response(
          {
            status: 403,
            msg: 'not allowed',
            error: 'not allowed',
          },
          403
        )
      )
    )

    await expect(request('/v2/example')).rejects.toThrow('not allowed')
    expect(toast.error).toHaveBeenCalledOnce()
  })

  it('recognizes unauthorized GraphQL errors', () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'invalid token',
          extensions: { code: 'UNAUTHORIZED' },
        },
      ],
    })

    expect(isUnauthorizedApolloError(error)).toBe(true)
  })
})
