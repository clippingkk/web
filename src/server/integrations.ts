import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Client as NotionClient } from '@notionhq/client'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { Resend } from 'resend'
import Stripe from 'stripe'
import { createPublicClient, http, verifyMessage } from 'viem'
import { mainnet } from 'viem/chains'

import { getServerEnv, requireEnv } from './env'
import { ApiError } from './errors'

export async function verifyTurnstile(token: string, ip?: string) {
  const secret = getServerEnv().CF_TURNSTILE_SECRET
  if (!secret && getServerEnv().NODE_ENV !== 'production') return true
  if (!secret) throw new ApiError('Cloudflare Turnstile is not configured', 503)
  const form = new FormData()
  form.set('secret', secret)
  form.set('response', token)
  if (ip) form.set('remoteip', ip)
  const result = (await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: form,
    }
  ).then((response) => response.json())) as { success?: boolean }
  if (!result.success) throw new ApiError('cloudflare turnstile verify failed')
  return true
}

export async function verifySmsCode(phone: string, code: string) {
  const env = getServerEnv()
  if (!env.LEAN_CLOUD_APP_ID || !env.LEAN_CLOUD_APP_KEY) {
    throw new ApiError('LeanCloud SMS is not configured', 503)
  }
  const response = await fetch(
    `${env.LEAN_CLOUD_HOST}/1.1/verifySmsCode/${code}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LC-Id': env.LEAN_CLOUD_APP_ID,
        'X-LC-Key': env.LEAN_CLOUD_APP_KEY,
      },
      body: JSON.stringify({ mobilePhoneNumber: phone }),
    }
  )
  if (!response.ok) throw new ApiError('SMS verification failed')
}

export async function sendOneTimePasscode(email: string, code: string) {
  const resend = new Resend(requireEnv('RESEND_API_KEY'))
  const result = await resend.emails.send({
    from: 'ClippingKK <noreply@annatarhe.com>',
    to: email,
    subject: `${code} is your ClippingKK one-time passcode`,
    html: `<main style="font-family:system-ui;max-width:560px;margin:auto"><h1>ClippingKK</h1><p>Your one-time passcode is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes.</p></main>`,
  })
  if (result.error) throw new ApiError(result.error.message, 502)
}

export async function sendVerificationEmail(email: string, code: string) {
  const resend = new Resend(requireEnv('RESEND_API_KEY'))
  const href = `${getServerEnv().APP_ORIGIN}/auth/verify?code=${encodeURIComponent(code)}`
  const result = await resend.emails.send({
    from: 'ClippingKK <noreply@annatarhe.com>',
    to: email,
    subject: 'Verify your ClippingKK account',
    html: `<main style="font-family:system-ui;max-width:560px;margin:auto"><h1>ClippingKK</h1><p>Finish creating your account:</p><p><a href="${href}">Verify email</a></p></main>`,
  })
  if (result.error) throw new ApiError(result.error.message, 502)
}

export async function verifyWeb3Signature(
  address: string,
  message: string,
  signature: string
) {
  try {
    return await verifyMessage({
      address: address.toLowerCase() as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })
  } catch {
    return false
  }
}

const appleKeys = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys')
)

export async function verifyAppleIdentityToken(
  token: string,
  platform: string
) {
  const env = getServerEnv()
  const audience =
    platform === 'web' ? env.APPLE_AUTH_SERVICE_ID : env.APPLE_AUTH_APP_PKG
  if (!audience) throw new ApiError('Apple Sign In is not configured', 503)
  try {
    const { payload } = await jwtVerify(token, appleKeys, {
      issuer: 'https://appleid.apple.com',
      audience,
      algorithms: ['RS256'],
    })
    if (!payload.sub) throw new Error('Apple subject is missing')
    return {
      unique: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : '',
    }
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'invalid Apple identity token'
    )
  }
}

export async function resolveEnsAvatar(address: string) {
  try {
    const client = createPublicClient({ chain: mainnet, transport: http() })
    const name = await client.getEnsName({ address: address as `0x${string}` })
    return name ? ((await client.getEnsAvatar({ name })) ?? '') : ''
  } catch {
    return ''
  }
}

let stripeClient: Stripe | undefined
export function getStripe() {
  stripeClient ??= new Stripe(requireEnv('STRIPE_SECRET'))
  return stripeClient
}

let s3Client: S3Client | undefined
export function getS3() {
  const env = getServerEnv()
  s3Client ??= new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: requireEnv('S3_ACCESS_KEY'),
      secretAccessKey: requireEnv('S3_SECRET_KEY'),
    },
  })
  return s3Client
}

export async function uploadObject(
  key: string,
  body: Uint8Array,
  contentType: string
) {
  const env = getServerEnv()
  await getS3().send(
    new PutObjectCommand({
      Bucket: requireEnv('S3_BUCKET'),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  const host = env.S3_HOST || `${env.S3_ENDPOINT}/${env.S3_BUCKET}`
  return `${host?.replace(/\/$/, '')}/${key}`
}

export function getNotion(token: string) {
  return new NotionClient({ auth: token })
}

export async function fetchGithubIdentity(code: string) {
  const tokenResponse = (await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: requireEnv('GITHUB_CLIENT_ID'),
        client_secret: requireEnv('GITHUB_CLIENT_SECRET'),
        code,
      }),
    }
  ).then((response) => response.json())) as {
    access_token?: string
    error_description?: string
  }
  if (!tokenResponse.access_token) {
    throw new ApiError(
      tokenResponse.error_description ?? 'GitHub authentication failed'
    )
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${tokenResponse.access_token}`,
  }
  const [profile, emails] = await Promise.all([
    fetch('https://api.github.com/user', { headers }).then((response) =>
      response.json()
    ) as Promise<{
      login: string
      avatar_url: string
      name?: string
      email?: string
    }>,
    fetch('https://api.github.com/user/emails', { headers }).then((response) =>
      response.json()
    ) as Promise<Array<{ email: string; primary: boolean; verified: boolean }>>,
  ])
  const email =
    profile.email ?? emails.find((item) => item.primary && item.verified)?.email
  if (!email) throw new ApiError('No verified GitHub email found')
  return {
    ...profile,
    email: email.toLowerCase(),
    accessToken: tokenResponse.access_token,
  }
}

export async function promptPalExecute(
  promptId: string,
  args: Record<string, unknown>
) {
  const env = getServerEnv()
  const response = await fetch(
    `${env.PROMPTPAL_ENDPOINT.replace(/\/$/, '')}/api/v1/prompts/${promptId}/execute`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${requireEnv('PROMPTPAL_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variables: args }),
    }
  )
  if (!response.ok)
    throw new ApiError(`PromptPal returned ${response.status}`, 502)
  const payload = (await response.json()) as {
    data?: { content?: string }
    content?: string
  }
  return payload.data?.content ?? payload.content ?? ''
}
