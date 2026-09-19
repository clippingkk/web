import { createHash } from 'node:crypto'

import { GraphQLError } from 'graphql'
// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  values: new Map<string, string>(),
  exchange: vi.fn(),
  refresh: vi.fn(),
  revoke: vi.fn(),
  verify: vi.fn(),
  provision: vi.fn(),
  config: {
    issuer: 'https://gate.test/api/auth',
    clientId: 'web-client',
    nativeClientId: 'native-client',
    nativeRedirectUri: 'com.annatarhe.clippingkk://oauth/callback',
    resource: 'https://clippingkk.annatarhe.com',
    scopes: 'openid profile email offline_access',
  },
}))
const user = {
  id: 7,
  gateUserId: 'gate-user',
  name: 'Reader',
  email: 'reader@example.com',
  avatar: '',
  deletedAt: null,
}
vi.mock('../config', () => ({ gateConfig: () => state.config }))
vi.mock('../authz', () => ({
  requireProductRead: vi.fn(async () => undefined),
}))
vi.mock('../verify', () => ({ verifyIdToken: state.verify }))
vi.mock('../user', () => ({
  ensureLocalUser: vi.fn(async () => user),
  provisionMember: state.provision,
}))
vi.mock('../../db', () => ({
  getDatabase: () => ({
    db: { query: { users: { findFirst: async () => user } } },
  }),
}))
vi.mock('../oidc', async (original) => ({
  ...(await original<typeof import('../oidc')>()),
  exchangeNativeCode: state.exchange,
  refreshTokens: state.refresh,
  revokeToken: state.revoke,
}))
vi.mock('../../redis', () => {
  const redis = {
    get: async (key: string) => state.values.get(key) ?? null,
    set: async (
      key: string,
      value: string,
      options: { NX?: boolean; XX?: boolean } = {}
    ) => {
      if (
        (options.NX && state.values.has(key)) ||
        (options.XX && !state.values.has(key))
      )
        return null
      state.values.set(key, value)
      return 'OK'
    },
    exists: async (key: string) => (state.values.has(key) ? 1 : 0),
    // Both scripts in play are "delete KEYS[1] if it still equals ARGV[1]".
    eval: async (
      _script: string,
      { keys, arguments: args }: { keys: string[]; arguments: string[] }
    ) =>
      state.values.get(keys[0]) === args[0] && state.values.delete(keys[0])
        ? 1
        : 0,
    sAdd: vi.fn(),
    sRem: vi.fn(),
  }
  return {
    getRedis: async () => redis,
    cacheGet: async (key: string) => {
      const value = state.values.get(key)
      return value ? JSON.parse(value) : undefined
    },
    cacheSet: async (key: string, value: unknown) =>
      state.values.set(key, JSON.stringify(value)),
    cacheDelete: async (key: string) => state.values.delete(key),
  }
})

import {
  destroyNativeSession,
  exchangeNative,
  nativeCredential,
  readNativeSession,
  startNative,
} from '../native'
import { readSession } from '../session'

const verifier = 'v'.repeat(43)
const challenge = createHash('sha256').update(verifier).digest('base64url')
const tokens = {
  accessToken: 'access',
  refreshToken: 'refresh',
  idToken: 'id-token',
  expiresIn: 600,
}

beforeEach(() => {
  state.values.clear()
  for (const mock of [
    state.exchange,
    state.refresh,
    state.revoke,
    state.verify,
    state.provision,
  ])
    mock.mockReset()
  state.config.nativeClientId = 'native-client'
  state.exchange.mockResolvedValue(tokens)
  state.revoke.mockResolvedValue(undefined)
  state.verify.mockResolvedValue({
    gateUserId: 'gate-user',
    email: user.email,
    name: user.name,
    emailVerified: true,
  })
})

async function signIn() {
  const start = await startNative(challenge)
  return exchangeNative({
    transactionId: start.transactionId,
    state: start.state,
    code: 'code',
    verifier,
  })
}

it('starts with the native client, fixed callback and resource', async () => {
  const start = await startNative(challenge)
  const url = new URL(start.authorizationUrl)
  expect(url.origin + url.pathname).toBe(
    'https://gate.test/api/auth/oauth2/authorize'
  )
  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    response_type: 'code',
    client_id: 'native-client',
    redirect_uri: 'com.annatarhe.clippingkk://oauth/callback',
    scope: 'openid profile email offline_access',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: start.state,
    resource: 'https://clippingkk.annatarhe.com',
  })
  expect(url.searchParams.get('nonce')).toMatch(/^[\w-]{43}$/)
  // The transaction id is a bearer of sorts; only its digest is stored.
  expect([...state.values.keys()].join()).not.toContain(start.transactionId)
})

it('rejects a malformed challenge and an unconfigured client', async () => {
  await expect(startNative('short')).rejects.toMatchObject({ status: 400 })
  state.config.nativeClientId = ''
  await expect(startNative(challenge)).rejects.toMatchObject({ status: 503 })
})

it('exchanges into an opaque credential backed by a native session', async () => {
  const result = await signIn()
  expect(result.token).toMatch(/^ck_ios_[\w-]{43}$/)
  expect(result.user).toEqual({
    id: 7,
    name: 'Reader',
    email: 'reader@example.com',
    avatar: '',
  })
  expect(state.exchange).toHaveBeenCalledWith({
    code: 'code',
    verifier,
    clientId: 'native-client',
  })
  // The ID token is checked against the native client, not the web one.
  expect(state.verify).toHaveBeenCalledWith(
    'id-token',
    expect.stringMatching(/^[\w-]{43}$/),
    'native-client'
  )
  expect(state.provision).toHaveBeenCalledWith(7)
  expect(
    [...state.values.keys(), ...state.values.values()].join()
  ).not.toContain(result.token)
  expect(await readNativeSession(result.token)).toMatchObject({
    localUserId: 7,
    kind: 'native',
    clientId: 'native-client',
    expiresAt: result.expiresAt,
  })
})

it('never accepts a native session id as a browser cookie', async () => {
  const { token } = await signIn()
  const id = createHash('sha256').update(token).digest('base64url')
  expect(await readSession(id, 'native')).not.toBeNull()
  expect(await readSession(id)).toBeNull()
})

it('rejects expired, mismatched and replayed transactions', async () => {
  await expect(
    exchangeNative({
      transactionId: 'unknown',
      state: 's',
      code: 'code',
      verifier,
    })
  ).rejects.toMatchObject({ status: 400 })

  const start = await startNative(challenge)
  const input = {
    transactionId: start.transactionId,
    state: start.state,
    code: 'code',
    verifier,
  }
  // A wrong state or verifier must not burn the attempt for the real callback.
  await expect(
    exchangeNative({ ...input, state: 'x'.repeat(43) })
  ).rejects.toMatchObject({ status: 400 })
  await expect(
    exchangeNative({ ...input, verifier: 'w'.repeat(43) })
  ).rejects.toMatchObject({ status: 400 })
  expect(state.exchange).not.toHaveBeenCalled()

  const results = await Promise.allSettled([
    exchangeNative(input),
    exchangeNative(input),
  ])
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
  expect(state.exchange).toHaveBeenCalledTimes(1)
  await expect(exchangeNative(input)).rejects.toMatchObject({ status: 400 })
})

it('refuses a grant without a refresh token', async () => {
  state.exchange.mockResolvedValue({ ...tokens, refreshToken: undefined })
  await expect(signIn()).rejects.toMatchObject({ status: 503 })
  expect([...state.values.keys()].join()).not.toContain('ck:gate:session')
})

it('revokes the grant and hides upstream detail when sign-in fails late', async () => {
  state.verify.mockRejectedValue(
    new GraphQLError('invalid id token: secret detail', {
      extensions: { code: 401 },
    })
  )
  await expect(signIn()).rejects.toMatchObject({
    status: 401,
    message: 'Sign-in could not be verified.',
  })
  expect(state.revoke).toHaveBeenCalledWith('refresh', 'native-client')

  state.exchange.mockRejectedValue(
    new GraphQLError('client secret mismatch', {
      extensions: { code: 401, gateError: 'invalid_client' },
    })
  )
  await expect(signIn()).rejects.toMatchObject({ status: 503 })
  state.exchange.mockRejectedValue(
    new GraphQLError('code expired', {
      extensions: { code: 400, gateError: 'invalid_grant' },
    })
  )
  await expect(signIn()).rejects.toMatchObject({ status: 400 })
})

it('refreshes and revokes as the native client', async () => {
  state.exchange.mockResolvedValue({ ...tokens, expiresIn: 0 })
  const { token } = await signIn()
  state.refresh.mockResolvedValue({
    accessToken: 'new',
    refreshToken: 'rotated',
    expiresIn: 600,
  })
  expect(await readNativeSession(token)).toMatchObject({ accessToken: 'new' })
  expect(state.refresh).toHaveBeenCalledWith('refresh', 'native-client')

  await destroyNativeSession(token)
  expect(state.revoke).toHaveBeenCalledWith('rotated', 'native-client')
  expect(await readNativeSession(token)).toBeNull()
})

it('keeps the credential through an outage and drops it on a rejected grant', async () => {
  state.exchange.mockResolvedValue({ ...tokens, expiresIn: 0 })
  const { token } = await signIn()
  state.refresh.mockRejectedValueOnce(new Error('network'))
  await expect(readNativeSession(token)).rejects.toMatchObject({ status: 503 })
  state.refresh.mockRejectedValueOnce(
    new GraphQLError('revoked', { extensions: { gateError: 'invalid_grant' } })
  )
  expect(await readNativeSession(token)).toBeNull()
})

it('claims anything with the native prefix, and nothing else', () => {
  const request = (authorization?: string) =>
    new Request('https://example.test', {
      headers: authorization ? { authorization } : {},
    })
  expect(nativeCredential(request(`Bearer ck_ios_${'a'.repeat(43)}`))).toBe(
    `ck_ios_${'a'.repeat(43)}`
  )
  expect(nativeCredential(request('Bearer ck_ios_bad'))).toBe('ck_ios_bad')
  expect(nativeCredential(request('Bearer eyJhbGciOi'))).toBeNull()
  expect(nativeCredential(request('X-CLI ck_ios_x'))).toBeNull()
  expect(nativeCredential(request())).toBeNull()
})

it('treats a malformed credential as signed out without touching Redis', async () => {
  expect(await readNativeSession('ck_ios_bad')).toBeNull()
  await destroyNativeSession('ck_ios_bad')
  expect(state.revoke).not.toHaveBeenCalled()
})
