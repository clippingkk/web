import { connection } from 'next/server'

import type { ApiErrorResponse, ApiSuccessResponse } from '@/contracts/http'

import { getServerEnv } from './env'
import { ApiError } from './errors'

type Handler = (request: Request, context?: unknown) => Promise<Response>

export function json<T>(data: T, status = 200, msg = '') {
  const payload: ApiSuccessResponse<T> = { status, msg, data }
  return Response.json(payload, { status })
}

export function errorJson(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500
  const message =
    error instanceof Error ? error.message : 'internal server error'
  if (status >= 500) console.error(error)
  const payload: ApiErrorResponse = {
    status,
    msg: message,
    error: message,
  }
  return Response.json(payload, { status })
}

function corsHeaders(request: Request) {
  const env = getServerEnv()
  const origin = request.headers.get('origin')
  const allowed =
    origin && env.corsAllowedOrigins.has(origin) ? origin : env.APP_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers':
      'Authorization, Content-Type, X-Basic, X-Accept-Language, Sentry-Trace, Baggage',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    Vary: 'Origin',
  }
}

function withCors(response: Response, request: Request) {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export function route(handler: Handler): Handler {
  return async (request, context) => {
    await connection()
    try {
      return withCors(await handler(request, context), request)
    } catch (error) {
      return withCors(errorJson(error), request)
    }
  }
}

export const options = route(async () => new Response(null, { status: 204 }))

export async function body<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new ApiError('invalid JSON body')
  }
}
