import {
  Environment,
  InAppOwnershipType,
  SignedDataVerifier,
  VerificationException,
  VerificationStatus,
  type JWSRenewalInfoDecodedPayload,
  type JWSTransactionDecodedPayload,
  type ResponseBodyV2DecodedPayload,
} from '@apple/app-store-server-library'
import { decodeJwt } from 'jose'

import { getServerEnv } from '../../env'
import { ApiError } from '../../errors'
import { appleRootCertificates } from './certs'

export type AppleTransaction = JWSTransactionDecodedPayload
export type AppleRenewalInfo = JWSRenewalInfoDecodedPayload
export type AppleNotification = ResponseBodyV2DecodedPayload

function invalid(message = 'This App Store purchase could not be verified.') {
  return new ApiError(message, 400, 'APPLE_TRANSACTION_INVALID')
}

export function appleProductIds() {
  return new Set(
    getServerEnv()
      .APPLE_IAP_PRODUCT_IDS.split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  )
}

/**
 * The environment a payload claims, if we accept it. The library verifies the
 * claim again; this only picks which verifier to use. Xcode data is unsigned,
 * so it is never accepted in production.
 */
function acceptedEnvironment(claim: unknown): Environment {
  const env = getServerEnv()
  if (claim === Environment.PRODUCTION) return Environment.PRODUCTION
  if (claim === Environment.SANDBOX && env.APPLE_IAP_ALLOW_SANDBOX === '1')
    return Environment.SANDBOX
  if (
    claim === Environment.XCODE &&
    env.APPLE_IAP_ALLOW_XCODE === '1' &&
    env.NODE_ENV !== 'production'
  )
    return Environment.XCODE
  throw invalid('Purchases from this App Store environment are not accepted.')
}

const verifiers = new Map<string, SignedDataVerifier>()

function verifierFor(environment: Environment) {
  const env = getServerEnv()
  const appAppleId = env.APPLE_IAP_APP_APPLE_ID
    ? Number(env.APPLE_IAP_APP_APPLE_ID)
    : undefined
  if (environment === Environment.PRODUCTION && !appAppleId) {
    console.error('billing: APPLE_IAP_APP_APPLE_ID is required in production')
    throw new ApiError(
      'App Store purchases are not configured.',
      503,
      'APPLE_NOT_CONFIGURED'
    )
  }
  const key = `${environment}:${env.APPLE_IAP_BUNDLE_ID}:${appAppleId ?? ''}`
  let verifier = verifiers.get(key)
  if (!verifier) {
    verifier = new SignedDataVerifier(
      appleRootCertificates(),
      // Revocation (OCSP) and current-date checks; an OCSP outage is retryable.
      environment !== Environment.XCODE,
      environment,
      env.APPLE_IAP_BUNDLE_ID,
      appAppleId
    )
    verifiers.set(key, verifier)
  }
  return verifier
}

function claimed(
  jws: string,
  read: (payload: Record<string, unknown>) => unknown
) {
  try {
    return read(decodeJwt(jws) as Record<string, unknown>)
  } catch {
    throw invalid()
  }
}

async function verified<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (
      error instanceof VerificationException &&
      error.status === VerificationStatus.RETRYABLE_VERIFICATION_FAILURE
    ) {
      console.error('billing: App Store verification unavailable', error)
      throw new ApiError(
        'The App Store could not be reached. Retry shortly.',
        503,
        'APPLE_UNAVAILABLE'
      )
    }
    console.error('billing: App Store data failed verification', error)
    throw invalid()
  }
}

/** A signed transaction for one of our subscription products, verified. */
export async function verifyTransaction(
  jws: string
): Promise<AppleTransaction> {
  const environment = acceptedEnvironment(claimed(jws, (p) => p.environment))
  const transaction = await verified(() =>
    verifierFor(environment).verifyAndDecodeTransaction(jws)
  )
  if (
    !transaction.originalTransactionId ||
    !transaction.transactionId ||
    !transaction.productId ||
    !transaction.expiresDate ||
    !transaction.signedDate
  )
    throw invalid()
  if (!appleProductIds().has(transaction.productId))
    throw invalid('This App Store product is not a ClippingKK subscription.')
  // Family Sharing is off for these products; a shared copy is not this
  // reader's purchase.
  if (transaction.inAppOwnershipType !== InAppOwnershipType.PURCHASED)
    throw invalid('Only your own App Store purchases can be used.')
  return transaction
}

export async function verifyRenewalInfo(
  jws: string
): Promise<AppleRenewalInfo> {
  const environment = acceptedEnvironment(claimed(jws, (p) => p.environment))
  return verified(() =>
    verifierFor(environment).verifyAndDecodeRenewalInfo(jws)
  )
}

/** An App Store Server Notification (V2) `signedPayload`, verified. */
export async function verifyNotification(
  signedPayload: string
): Promise<AppleNotification> {
  type Claims = { environment?: unknown } | undefined
  const environment = acceptedEnvironment(
    claimed(
      signedPayload,
      (p) =>
        (p.data as Claims)?.environment ?? (p.summary as Claims)?.environment
    )
  )
  return verified(() =>
    verifierFor(environment).verifyAndDecodeNotification(signedPayload)
  )
}
