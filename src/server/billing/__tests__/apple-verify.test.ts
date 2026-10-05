// @vitest-environment node
import { createHash } from 'node:crypto'

import { beforeEach, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({
  env: {} as Record<string, string>,
  decoded: {} as Record<string, unknown>,
  failure: null as unknown,
  constructed: [] as unknown[][],
}))
vi.mock('../../env', () => ({ getServerEnv: () => state.env }))
vi.mock('@apple/app-store-server-library', async (original) => {
  const actual =
    await original<typeof import('@apple/app-store-server-library')>()
  class SignedDataVerifier {
    constructor(...args: unknown[]) {
      if (args[2] === actual.Environment.PRODUCTION && !args[4])
        throw new Error('appAppleId is required')
      state.constructed.push(args)
    }
    async verifyAndDecodeTransaction() {
      if (state.failure) throw state.failure
      return state.decoded
    }
    async verifyAndDecodeNotification() {
      if (state.failure) throw state.failure
      return state.decoded
    }
  }
  return { ...actual, SignedDataVerifier }
})
import {
  VerificationException,
  VerificationStatus,
} from '@apple/app-store-server-library'

import { APPLE_ROOT_CA_G3_SHA256, appleRootCertificates } from '../apple/certs'
import { verifyNotification, verifyTransaction } from '../apple/verify'

/** An unsigned JWS whose claims pick the verifier; the fake does the rest. */
function jws(claims: Record<string, unknown>) {
  const part = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${part({ alg: 'ES256' })}.${part(claims)}.signature`
}
const purchase = {
  originalTransactionId: '1000',
  transactionId: '1001',
  productId: 'com.annatarhe.clippingkk.premium.yearly',
  expiresDate: Date.now() + 86_400_000,
  signedDate: Date.now(),
  inAppOwnershipType: 'PURCHASED',
  environment: 'Sandbox',
}

beforeEach(() => {
  state.env = {
    NODE_ENV: 'production',
    APPLE_IAP_BUNDLE_ID: 'com.annatarhe.clippingkk.clippingkk-ios',
    APPLE_IAP_APP_APPLE_ID: '1234567890',
    APPLE_IAP_PRODUCT_IDS:
      'com.annatarhe.clippingkk.premium.monthly, com.annatarhe.clippingkk.premium.yearly',
    APPLE_IAP_ALLOW_SANDBOX: '1',
    APPLE_IAP_ALLOW_XCODE: '1',
  }
  state.decoded = { ...purchase }
  state.failure = null
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

it('pins Apple Root CA - G3', () => {
  const [root] = appleRootCertificates()
  expect(createHash('sha256').update(root).digest('hex').toUpperCase()).toBe(
    APPLE_ROOT_CA_G3_SHA256
  )
  expect(APPLE_ROOT_CA_G3_SHA256).toBe(
    '63343ABFB89A6A03EBB57E9B3F5FA7BE7C4F5C756F3017B3A8C488C3653E9179'
  )
})

it('verifies a sandbox purchase of one of our products', async () => {
  await expect(
    verifyTransaction(jws({ environment: 'Sandbox' }))
  ).resolves.toMatchObject({
    transactionId: '1001',
  })
  const [roots, online, environment, bundle] = state.constructed.at(-1)!
  expect((roots as Buffer[])[0]).toEqual(appleRootCertificates()[0])
  expect([online, environment, bundle]).toEqual([
    true,
    'Sandbox',
    'com.annatarhe.clippingkk.clippingkk-ios',
  ])
})

it('refuses sandbox purchases when they are turned off', async () => {
  state.env.APPLE_IAP_ALLOW_SANDBOX = '0'
  await expect(
    verifyTransaction(jws({ environment: 'Sandbox' }))
  ).rejects.toMatchObject({
    status: 400,
    code: 'APPLE_TRANSACTION_INVALID',
  })
})

it('never accepts unsigned Xcode transactions in production', async () => {
  await expect(
    verifyTransaction(jws({ environment: 'Xcode' }))
  ).rejects.toMatchObject({
    status: 400,
  })
  await expect(
    verifyTransaction(jws({ environment: 'LocalTesting' }))
  ).rejects.toMatchObject({
    status: 400,
  })
})

it('refuses products and ownership that are not ours', async () => {
  state.decoded = { ...purchase, productId: 'com.example.other' }
  await expect(
    verifyTransaction(jws({ environment: 'Sandbox' }))
  ).rejects.toMatchObject({
    status: 400,
  })
  state.decoded = { ...purchase, inAppOwnershipType: 'FAMILY_SHARED' }
  await expect(
    verifyTransaction(jws({ environment: 'Sandbox' }))
  ).rejects.toMatchObject({
    status: 400,
  })
})

it('turns a bad signature into 400 and an OCSP outage into 503', async () => {
  state.failure = new VerificationException(
    VerificationStatus.VERIFICATION_FAILURE
  )
  await expect(
    verifyTransaction(jws({ environment: 'Sandbox' }))
  ).rejects.toMatchObject({
    status: 400,
  })
  state.failure = new VerificationException(
    VerificationStatus.RETRYABLE_VERIFICATION_FAILURE
  )
  await expect(
    verifyTransaction(jws({ environment: 'Sandbox' }))
  ).rejects.toMatchObject({
    status: 503,
  })
})

it('needs the app Apple ID before trusting production purchases', async () => {
  state.env.APPLE_IAP_APP_APPLE_ID = ''
  await expect(
    verifyTransaction(jws({ environment: 'Production' }))
  ).rejects.toMatchObject({
    status: 503,
    code: 'APPLE_NOT_CONFIGURED',
  })
})

it('rejects payloads that are not JWS', async () => {
  await expect(verifyTransaction('not-a-jws')).rejects.toMatchObject({
    status: 400,
  })
})

it('reads a notification environment from its data', async () => {
  state.decoded = { notificationType: 'TEST', data: { environment: 'Sandbox' } }
  await expect(
    verifyNotification(jws({ data: { environment: 'Sandbox' } }))
  ).resolves.toMatchObject({ notificationType: 'TEST' })
})
