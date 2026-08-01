import { metrics, SpanStatusCode, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { withSpan } from '@superlog/otel-helpers'
import { connection } from 'next/server'

import type { ApiErrorResponse, ApiSuccessResponse } from '@/contracts/http'

import { getServerEnv } from './env'
import { ApiError } from './errors'

type Handler = (request: Request, context?: unknown) => Promise<Response>

const tracer = trace.getTracer('clippingkk.web.http')
const meter = metrics.getMeter('clippingkk.web.http')
const logger = logs.getLogger('clippingkk.web.http')
const routeOperations = meter.createCounter('app.http.server.operations', {
  description: 'Completed application HTTP operations',
})
const routeDuration = meter.createHistogram(
  'app.http.server.operation.duration',
  {
    description: 'Application HTTP operation duration',
    unit: 'ms',
  }
)

export function json<T>(data: T, status = 200, msg = '') {
  const payload: ApiSuccessResponse<T> = { status, msg, data }
  return Response.json(payload, { status })
}

export function errorJson(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500
  const message =
    error instanceof Error ? error.message : 'internal server error'
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

export function route(handler: Handler, operation = 'http.route'): Handler {
  return async (request, context) => {
    await connection()
    return withSpan(
      operation,
      async (span) => {
        const startedAt = performance.now()
        const method = request.method
        try {
          const response = withCors(await handler(request, context), request)
          const outcome = response.ok ? 'success' : 'error'
          const attributes = {
            operation,
            'http.request.method': method,
            'http.response.status_code': response.status,
            outcome,
          }
          span.setAttributes(attributes)
          if (!response.ok) span.setStatus({ code: SpanStatusCode.ERROR })
          routeOperations.add(1, attributes)
          logger.emit({
            severityNumber: response.ok
              ? SeverityNumber.INFO
              : SeverityNumber.WARN,
            severityText: response.ok ? 'INFO' : 'WARN',
            body: 'HTTP route completed',
            attributes,
          })
          return response
        } catch (error) {
          const response = withCors(errorJson(error), request)
          const errorType = error instanceof ApiError ? 'api_error' : 'internal'
          const attributes = {
            operation,
            'http.request.method': method,
            'http.response.status_code': response.status,
            'error.type': errorType,
            outcome: 'error',
          }
          span.recordException(
            error instanceof Error ? error : new Error(String(error))
          )
          span.setStatus({ code: SpanStatusCode.ERROR })
          span.setAttributes(attributes)
          routeOperations.add(1, attributes)
          logger.emit({
            severityNumber:
              response.status >= 500
                ? SeverityNumber.ERROR
                : SeverityNumber.WARN,
            severityText: response.status >= 500 ? 'ERROR' : 'WARN',
            body: 'HTTP route failed',
            attributes,
          })
          return response
        } finally {
          routeDuration.record(performance.now() - startedAt, {
            operation,
            'http.request.method': method,
          })
        }
      },
      { tracer }
    )
  }
}

export const options = route(
  async () => new Response(null, { status: 204 }),
  'http.options'
)

export async function body<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new ApiError('invalid JSON body')
  }
}
