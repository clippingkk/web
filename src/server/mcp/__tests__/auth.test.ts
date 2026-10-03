// @vitest-environment node
import { exportJWK, generateKeyPair, SignJWT } from 'jose'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const config = {
  issuer: 'https://gate.test/api/auth',
  jwksUrl: 'https://gate.test/.well-known/jwks.json',
  resource: 'https://clippingkk.example',
  appOrigin: 'https://clippingkk.example',
}
const { findFirst, resolveMcpToken } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  resolveMcpToken: vi.fn(),
}))
vi.mock('../../gate/config', () => ({ gateConfig: () => config }))
vi.mock('../../db', () => ({
  getDatabase: () => ({ db: { query: { users: { findFirst } } } }),
}))
vi.mock('../tokens', () => ({
  isMcpToken: (token: string) => token.startsWith('ck_mcp_'),
  resolveMcpToken,
}))

const { publicKey, privateKey } = await generateKeyPair('ES256')
const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'ES256' }
vi.stubGlobal(
  'fetch',
  vi.fn(async () => Response.json({ keys: [jwk] }))
)

const { authenticateMcpRequest } = await import('../auth')

function accessToken(claims: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({
    iss: config.issuer,
    // Gate adds its userinfo endpoint to `aud` when `openid` is in scope.
    aud: [config.resource, `${config.issuer}/oauth2/userinfo`],
    sub: 'gate-owner',
    azp: 'https://claude.ai/oauth/client.json',
    scope: 'openid profile',
    iat: now,
    exp: now + 600,
    ...claims,
  })
    .setProtectedHeader({ alg: 'ES256', kid: 'test' })
    .sign(privateKey)
}

const bearer = (token: string) =>
  new Request('https://clippingkk.example/api/v3/mcp', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })

beforeEach(() => {
  findFirst.mockResolvedValue({ id: 7 })
})

describe('Gate access tokens', () => {
  it('maps a valid token to the linked reader', async () => {
    const auth = await authenticateMcpRequest(bearer(await accessToken()))
    expect(auth).toMatchObject({
      clientId: 'https://claude.ai/oauth/client.json',
      scopes: ['openid', 'profile'],
      extra: { userId: 7 },
      resourceMetadataUrl:
        'https://clippingkk.example/.well-known/oauth-protected-resource',
    })
  })

  it.each([
    ['another product’s audience', { aud: 'https://api.other.example' }],
    ['a foreign issuer', { iss: 'https://evil.example' }],
    ['an expired token', { exp: Math.floor(Date.now() / 1000) - 60 }],
  ])('rejects %s with a 401 challenge', async (_, claims) => {
    const response = await authenticateMcpRequest(
      bearer(await accessToken(claims))
    )
    expect(response).toBeInstanceOf(Response)
    expect((response as Response).status).toBe(401)
    expect((response as Response).headers.get('www-authenticate')).toContain(
      'resource_metadata="https://clippingkk.example/.well-known/oauth-protected-resource"'
    )
  })

  it('answers 403, not a new challenge, when no ClippingKK account is linked', async () => {
    findFirst.mockResolvedValue(undefined)
    const response = (await authenticateMcpRequest(
      bearer(await accessToken())
    )) as Response
    expect(response.status).toBe(403)
    expect(response.headers.get('www-authenticate')).toBeNull()
  })
})

describe('personal access tokens', () => {
  it('accepts a live token', async () => {
    resolveMcpToken.mockResolvedValue({
      tokenId: 3,
      userId: 9,
      expiresAt: null,
    })
    expect(
      await authenticateMcpRequest(bearer(`ck_mcp_${'a'.repeat(43)}`))
    ).toMatchObject({ clientId: 'ck-pat:3', extra: { userId: 9 } })
  })

  it('challenges an unknown token without trying it as a JWT', async () => {
    resolveMcpToken.mockResolvedValue(null)
    const response = (await authenticateMcpRequest(
      bearer(`ck_mcp_${'b'.repeat(43)}`)
    )) as Response
    expect(response.status).toBe(401)
    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('ck_mcp_'),
      expect.anything()
    )
  })
})
