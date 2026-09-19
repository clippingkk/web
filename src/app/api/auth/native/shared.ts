import { z } from 'zod'

import { ApiError } from '@/server/errors'
import { nativeCredential } from '@/server/gate/native'
import { json } from '@/server/http'

/** Credentials and one-time codes pass through these routes; none may be cached. */
export function noStore<T>(data: T, status = 200) {
  const response = json(data, status)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export function credential(request: Request) {
  const token = nativeCredential(request)
  if (!token) throw new ApiError('Sign in again', 401, 'UNAUTHORIZED')
  return token
}

/** Bounds even a chunked body instead of trusting Content-Length. */
export async function body<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<T> {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new ApiError('Expected JSON.', 415)
  const reader = request.body?.getReader()
  if (!reader) throw new ApiError('Missing request body.', 400)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > 8192) {
        await reader.cancel()
        throw new ApiError('Request is too large.', 413)
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')))
  } catch {
    throw new ApiError('Invalid request.', 400)
  }
}
