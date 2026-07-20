import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import { getServerEnv } from './env'
import { ApiError } from './errors'

function keyFromSecret(secret: string) {
  let result = ''
  while (result.length <= 32) result += `|||${secret}`
  return Buffer.from(result.slice(0, 32))
}

export async function encodeLegacyValue(value: string) {
  const secret = getServerEnv().WECHAT_SECRET
  if (!secret) throw new ApiError('WECHAT_SECRET is not configured', 503)
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cfb', keyFromSecret(secret), iv)
  const encoded = Buffer.from(value).toString('base64')
  const padding = 16 - (encoded.length % 16)
  const padded = Buffer.from(encoded.padEnd(encoded.length + padding, ' '))
  return Buffer.concat([iv, cipher.update(padded), cipher.final()]).toString(
    'base64'
  )
}

export async function decodeLegacyValue(value: string) {
  const secret = getServerEnv().WECHAT_SECRET
  if (!secret) throw new ApiError('WECHAT_SECRET is not configured', 503)
  const payload = Buffer.from(value, 'base64')
  if (payload.length < 16)
    throw new ApiError('ciphertext too short', 401, 'UNAUTHORIZED')
  const decipher = createDecipheriv(
    'aes-256-cfb',
    keyFromSecret(secret),
    payload.subarray(0, 16)
  )
  const plain = Buffer.concat([
    decipher.update(payload.subarray(16)),
    decipher.final(),
  ])
  return Buffer.from(plain.toString('utf8').trim(), 'base64').toString('utf8')
}
