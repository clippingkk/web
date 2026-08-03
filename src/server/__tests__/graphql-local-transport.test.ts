import { headers } from 'next/headers'

import {
  LOCAL_GRAPHQL_URL,
  localGraphQLFetch,
} from '../graphql/local-transport'
import { yoga } from '../graphql/yoga'

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('../graphql/yoga', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../graphql/yoga')>()
  return {
    ...actual,
    yoga: { fetch: vi.fn() },
  }
})

const yogaFetch = vi.mocked(yoga.fetch)

function ok() {
  return new Response(JSON.stringify({ data: { __typename: 'Query' } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.mocked(headers).mockResolvedValue(new Headers() as never)
  yogaFetch.mockResolvedValue(ok() as never)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function post(body: unknown, init: RequestInit = {}) {
  return localGraphQLFetch(LOCAL_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  })
}

test('hands the operation to the in-process schema without opening a socket', async () => {
  const fetchMock = vi.fn(() => {
    throw new Error('the network must not be touched')
  })
  vi.stubGlobal('fetch', fetchMock)

  const response = await post({ query: '{ __typename }' })

  expect(response.status).toBe(200)
  expect(fetchMock).not.toHaveBeenCalled()
  expect(yogaFetch).toHaveBeenCalledOnce()

  const request = yogaFetch.mock.calls[0][0] as unknown as Request
  expect(request.method).toBe('POST')
  // The path has to keep matching yoga's graphqlEndpoint or it answers 404.
  expect(new URL(request.url).pathname).toBe('/api/v2/graphql')
  await expect(request.json()).resolves.toEqual({ query: '{ __typename }' })
})

test('preserves the caller Authorization header', async () => {
  await post(
    { query: '{ __typename }' },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer server-side-token',
      },
    }
  )

  const request = yogaFetch.mock.calls[0][0] as unknown as Request
  expect(request.headers.get('Authorization')).toBe('Bearer server-side-token')
})

test('forwards the real client ip so resolvers do not see the server itself', async () => {
  vi.mocked(headers).mockResolvedValue(
    new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }) as never
  )

  await post({ query: '{ __typename }' })

  const request = yogaFetch.mock.calls[0][0] as unknown as Request
  expect(request.headers.get('x-forwarded-for')).toBe('203.0.113.7, 10.0.0.1')
})

test('still works outside a request scope, such as at build time', async () => {
  vi.mocked(headers).mockRejectedValue(
    new Error('called outside a request scope')
  )

  const response = await post({ query: '{ __typename }' })

  expect(response.status).toBe(200)
  expect(yogaFetch).toHaveBeenCalledOnce()
})
