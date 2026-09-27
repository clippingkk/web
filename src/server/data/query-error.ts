import 'server-only'
import { notFound, redirect, unstable_rethrow } from 'next/navigation'

import { authHref } from '@/lib/auth-href'
import { classifyApolloError } from '@/services/apollo-errors'

import { currentPath } from './current-path'

export type QueryErrorOptions = {
  /** Where sign-in should return to. Defaults to the page being rendered. */
  next?: string
  /** 'null' resolves missing/forbidden data to null instead of notFound(). */
  notFound?: 'throw' | 'null'
  /** 'null' resolves a lost session to null instead of redirecting to sign-in. */
  unauthorized?: 'redirect' | 'null'
}

/**
 * Turns a failed server-side GraphQL operation into what the page should do:
 *
 * - UNAUTHORIZED / 401 -> redirect to sign-in, returning to `next`
 * - NOT_FOUND / 404 and FORBIDDEN / 403 -> notFound(), so a private resource
 *   is indistinguishable from a missing one
 * - anything else is rethrown for the route's error boundary
 *
 * Resolves to null only when the options ask for it.
 */
export async function handleQueryError(
  error: unknown,
  options: QueryErrorOptions = {}
): Promise<null> {
  // redirect()/notFound()/prerender bailouts thrown further down stay Next's.
  unstable_rethrow(error)
  const kind = classifyApolloError(error)
  if (kind === 'unauthorized') {
    if (options.unauthorized === 'null') return null
    redirect(authHref(options.next ?? (await currentPath())))
  }
  if (kind === 'not_found' || kind === 'forbidden') {
    if (options.notFound === 'null') return null
    notFound()
  }
  throw error
}
