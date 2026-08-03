import { trace } from '@opentelemetry/api'
import { withSpan } from '@superlog/otel-helpers'
import { headers } from 'next/headers'

import { GRAPHQL_ENDPOINT, yoga } from './yoga'

const tracer = trace.getTracer('clippingkk.web.graphql.local')

// This origin is never dialed. It only keeps the URL well-formed for `new Request`,
// and the path has to match GRAPHQL_ENDPOINT or yoga answers with a 404.
export const LOCAL_GRAPHQL_URL = `http://localhost${GRAPHQL_ENDPOINT}`

/**
 * A fetch-shaped transport that hands the request straight to the in-process yoga
 * instance instead of opening a socket back to our own public origin. Keeps yoga's
 * context creation, error masking and response shape, so Apollo's HttpLink needs no
 * special casing.
 */
export const localGraphQLFetch = (async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  const request = new Request(input, init)

  try {
    const incoming = await headers()
    const forwardedFor = incoming.get('x-forwarded-for')
    if (forwardedFor) {
      request.headers.set('x-forwarded-for', forwardedFor)
    }
  } catch {
    // no request scope (build time / prerender) — nothing to forward
  }

  return withSpan('graphql.local.request', () => yoga.fetch(request), {
    tracer,
  })
}) as typeof fetch
