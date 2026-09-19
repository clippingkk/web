import { generateKeyPair, SignJWT, exportJWK } from 'jose'
// @vitest-environment node
import { expect, it, vi } from 'vitest'
const config = {
  issuer: 'https://gate.test/api/auth',
  clientId: 'clippingkk',
  jwksUrl: 'https://gate.test/.well-known/jwks.json',
}
vi.mock('../config', () => ({ gateConfig: () => config }))
const { publicKey, privateKey } = await generateKeyPair('ES256')
const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'ES256' }
vi.stubGlobal(
  'fetch',
  vi.fn(async () => Response.json({ keys: [jwk] }))
)
const { verifyIdToken } = await import('../verify')
async function token(overrides = {}) {
  return new SignJWT({
    email: 'person@example.com',
    email_verified: true,
    nonce: 'nonce',
    ...overrides,
  })
    .setProtectedHeader({ alg: 'ES256', kid: 'test' })
    .setIssuer(config.issuer)
    .setAudience(config.clientId)
    .setSubject('person')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey)
}
it('verifies signed claims and the initiating nonce', async () => {
  expect(await verifyIdToken(await token(), 'nonce')).toMatchObject({
    gateUserId: 'person',
    emailVerified: true,
  })
  await expect(verifyIdToken(await token(), 'different')).rejects.toThrow(
    'nonce'
  )
})
it('rejects expired, wrong-issuer, and wrong-audience tokens', async () => {
  for (const claims of [
    { exp: 1 },
    { exp: undefined },
    { iat: undefined },
    { iss: 'https://evil.test' },
    { aud: 'other-product' },
  ]) {
    const signed = await new SignJWT({
      email: 'person@example.com',
      nonce: 'nonce',
      sub: 'person',
      iss: config.issuer,
      aud: config.clientId,
      exp: Math.floor(Date.now() / 1000) + 60,
      iat: Math.floor(Date.now() / 1000),
      ...claims,
    })
      .setProtectedHeader({ alg: 'ES256', kid: 'test' })
      .sign(privateKey)
    await expect(verifyIdToken(signed, 'nonce')).rejects.toThrow()
  }
})
it('checks a native sign-in against its own client instead of the web one', async () => {
  const native = async (claims = {}) =>
    new SignJWT({
      email: 'person@example.com',
      email_verified: true,
      nonce: 'nonce',
      ...claims,
    })
      .setProtectedHeader({ alg: 'ES256', kid: 'test' })
      .setIssuer(config.issuer)
      .setAudience('ios-client')
      .setSubject('person')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey)
  expect(
    await verifyIdToken(
      await native({ azp: 'ios-client' }),
      'nonce',
      'ios-client'
    )
  ).toMatchObject({ gateUserId: 'person' })
  // Issued to the native client, so the default (web) audience must refuse it,
  await expect(verifyIdToken(await native(), 'nonce')).rejects.toThrow()
  // and a web token must not pass as a native one.
  await expect(
    verifyIdToken(await token(), 'nonce', 'ios-client')
  ).rejects.toThrow()
  await expect(
    verifyIdToken(await native({ azp: config.clientId }), 'nonce', 'ios-client')
  ).rejects.toThrow('authorized party')
})
