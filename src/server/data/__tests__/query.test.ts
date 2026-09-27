import { CombinedGraphQLErrors, ServerError } from '@apollo/client'
import { parse } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url })
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
  unstable_rethrow: vi.fn(),
}))
vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('next/server', () => ({ connection: vi.fn(async () => undefined) }))
// The real client would dial yoga in-process; hand back a stub instead.
vi.mock('@apollo/client-integration-nextjs', () => ({
  ApolloClient: vi.fn(),
  InMemoryCache: vi.fn(),
  SSRMultipartLink: vi.fn(),
  registerApolloClient: () => ({ getClient: () => ({ query: mocks.query }) }),
}))
vi.mock('@/server/graphql/local-transport', () => ({
  LOCAL_GRAPHQL_URL: 'http://localhost/api/v2/graphql',
  localGraphQLFetch: vi.fn(),
}))

import { doApolloServerQuery } from '@/services/apollo.server'

import { serverQuery } from '../query'

const Doc = parse('query probe($id: Int) { me(id: $id) { id } }')

function graphQLError(extensions: Record<string, unknown>) {
  return new CombinedGraphQLErrors({
    errors: [{ message: 'nope', extensions }],
  })
}

function serverError(statusCode: number) {
  return new ServerError('transport', {
    response: new Response('', { status: statusCode }),
    bodyText: '',
  })
}

const PAGE = '/dash/42/clippings/7?iac=0'

beforeEach(() => {
  mocks.query.mockReset()
  mocks.redirect.mockClear()
  mocks.notFound.mockClear()
  mocks.headers
    .mockReset()
    .mockResolvedValue(new Headers({ 'x-ck-path': PAGE }))
})

it('queries the network with the variables and returns the data', async () => {
  mocks.query.mockResolvedValue({ data: { me: { id: 1 } } })
  await expect(
    serverQuery(Doc, { id: 1 }, { context: { headers: { a: 'b' } } })
  ).resolves.toEqual({ me: { id: 1 } })
  expect(mocks.query).toHaveBeenCalledWith({
    query: Doc,
    variables: { id: 1 },
    fetchPolicy: 'network-only',
    context: { headers: { a: 'b' } },
  })
})

describe.each([
  ['code', { code: 'UNAUTHORIZED' }],
  ['http status', { http: { status: 401 } }],
])('unauthorized by %s', (_, extensions) => {
  it('redirects to sign-in, returning to the current page', async () => {
    mocks.query.mockRejectedValue(graphQLError(extensions))
    await expect(serverQuery(Doc)).rejects.toThrow('NEXT_REDIRECT')
    expect(mocks.redirect).toHaveBeenCalledWith(
      `/auth?next=${encodeURIComponent(PAGE)}`
    )
  })

  it('prefers an explicit next over the current page', async () => {
    mocks.query.mockRejectedValue(graphQLError(extensions))
    await expect(
      serverQuery(Doc, undefined, { next: '/dash/42/upload' })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(mocks.redirect).toHaveBeenCalledWith(
      `/auth?next=${encodeURIComponent('/dash/42/upload')}`
    )
    expect(mocks.headers).not.toHaveBeenCalled()
  })

  it('resolves to null when asked to', async () => {
    mocks.query.mockRejectedValue(graphQLError(extensions))
    await expect(
      serverQuery(Doc, undefined, { unauthorized: 'null' })
    ).resolves.toBeNull()
    expect(mocks.redirect).not.toHaveBeenCalled()
  })
})

it('treats a transport-level 401 as a lost session', async () => {
  mocks.query.mockRejectedValue(serverError(401))
  await expect(serverQuery(Doc)).rejects.toThrow('NEXT_REDIRECT')
  expect(mocks.redirect).toHaveBeenCalledOnce()
})

it('falls back to / when the proxy did not forward a path', async () => {
  mocks.headers.mockResolvedValue(new Headers())
  mocks.query.mockRejectedValue(graphQLError({ code: 'UNAUTHORIZED' }))
  await expect(serverQuery(Doc)).rejects.toThrow('NEXT_REDIRECT')
  expect(mocks.redirect).toHaveBeenCalledWith(
    `/auth?next=${encodeURIComponent('/')}`
  )
})

it('ranks a lost session above a missing resource', async () => {
  mocks.query.mockRejectedValue(
    new CombinedGraphQLErrors({
      errors: [
        { message: 'a', extensions: { code: 'NOT_FOUND' } },
        { message: 'b', extensions: { code: 'UNAUTHORIZED' } },
      ],
    })
  )
  await expect(serverQuery(Doc)).rejects.toThrow('NEXT_REDIRECT')
  expect(mocks.notFound).not.toHaveBeenCalled()
})

describe.each([
  ['NOT_FOUND code', { code: 'NOT_FOUND' }],
  ['404 status', { code: 'BAD_REQUEST', http: { status: 404 } }],
  ['FORBIDDEN code', { code: 'FORBIDDEN' }],
  ['403 status', { http: { status: 403 } }],
])('%s', (_, extensions) => {
  it('renders not-found, hiding whether the resource exists', async () => {
    mocks.query.mockRejectedValue(graphQLError(extensions))
    await expect(serverQuery(Doc)).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it("resolves to null with notFound: 'null'", async () => {
    mocks.query.mockRejectedValue(graphQLError(extensions))
    await expect(
      serverQuery(Doc, undefined, { notFound: 'null' })
    ).resolves.toBeNull()
    expect(mocks.notFound).not.toHaveBeenCalled()
  })
})

it.each([
  ['a transport-level 404 (misrouted endpoint)', serverError(404)],
  ['an unexpected GraphQL error', graphQLError({ code: 'INTERNAL' })],
  ['a network failure', new TypeError('fetch failed')],
])('rethrows %s', async (_, error) => {
  mocks.query.mockRejectedValue(error)
  await expect(serverQuery(Doc, undefined, { notFound: 'null' })).rejects.toBe(
    error
  )
  expect(mocks.notFound).not.toHaveBeenCalled()
  expect(mocks.redirect).not.toHaveBeenCalled()
})

describe('doApolloServerQuery (deprecated wrapper)', () => {
  it('keeps its { data } shape', async () => {
    mocks.query.mockResolvedValue({ data: { me: { id: 3 } } })
    await expect(doApolloServerQuery({ query: Doc })).resolves.toEqual({
      data: { me: { id: 3 } },
    })
  })

  it('maps errors exactly like serverQuery', async () => {
    mocks.query.mockRejectedValueOnce(graphQLError({ code: 'UNAUTHORIZED' }))
    await expect(doApolloServerQuery({ query: Doc })).rejects.toThrow(
      'NEXT_REDIRECT'
    )
    expect(mocks.redirect).toHaveBeenCalledWith(
      `/auth?next=${encodeURIComponent(PAGE)}`
    )

    mocks.query.mockRejectedValueOnce(graphQLError({ code: 'FORBIDDEN' }))
    await expect(doApolloServerQuery({ query: Doc })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )

    const unexpected = new Error('boom')
    mocks.query.mockRejectedValueOnce(unexpected)
    await expect(doApolloServerQuery({ query: Doc })).rejects.toBe(unexpected)
  })
})
