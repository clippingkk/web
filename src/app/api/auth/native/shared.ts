import { z } from 'zod'

import { ApiError } from '@/server/errors'
import { nativeCredential } from '@/server/gate/native'
import { boundedJson, json } from '@/server/http'

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

/** Native auth bodies are tiny: 8 KiB is plenty and caps abuse. */
export function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  return boundedJson(request, schema, 8192)
}
