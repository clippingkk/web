import 'server-only'
import type { Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'

import { PathUserDocument, type PathUserQuery } from '@/gql/graphql'
import { authHref } from '@/lib/auth-href'
import type { DashSection, SlugUser } from '@/utils/profile.utils'

import { serverQuery } from './query'
import { getViewer, type Viewer } from './viewer'

export type PathUser = PathUserQuery['me']

export type UserParam = { id: number } | { domain: string }

const MAX_INT = 2 ** 31 - 1

function decode(param: string) {
  try {
    return decodeURIComponent(param)
  } catch {
    return param
  }
}

/**
 * How a `[userid]` segment identifies a user: all digits is an id (as long as
 * it fits GraphQL's Int and is positive -- `me(id: 0)` would mean "whoever is
 * signed in"), anything else a domain, compared lowercase.
 */
export function parseUserParam(param: string): UserParam {
  if (/^\d+$/.test(param)) {
    const id = Number(param)
    if (id > 0 && id <= MAX_INT) return { id }
  }
  return { domain: decode(param).toLowerCase() }
}

async function byId(id: number) {
  return (await serverQuery(PathUserDocument, { id }, { notFound: 'null' }))?.me
}

async function byDomain(domain: string) {
  // An empty domain would fall through to `me` of the signed-in reader.
  if (!domain) return null
  return (await serverQuery(PathUserDocument, { domain }, { notFound: 'null' }))
    ?.me
}

/**
 * The user a `/dash/[userid]` URL points at, or notFound(). Cached per request.
 *
 * All-digit params are ids first; only when no such user exists is the param
 * tried as a legacy all-digit domain (new ones are rejected by the server).
 * A domain that misses in lowercase is retried as written, for legacy
 * mixed-case domains.
 */
export const resolvePathUser = cache(
  async (param: string): Promise<PathUser> => {
    const parsed = parseUserParam(param)
    const raw = decode(param)
    const user =
      ('id' in parsed ? await byId(parsed.id) : null) ??
      (await byDomain('id' in parsed ? raw : parsed.domain)) ??
      ('domain' in parsed && raw !== parsed.domain ? await byDomain(raw) : null)
    if (!user) notFound()
    return user
  }
)

/**
 * Whether a `[userid]` param names this user, without a query. All-digit
 * params compare by id only -- the same rule getUserSlug() follows -- so a
 * legacy numeric domain is never treated as this user's slug.
 */
export function isSameUser(param: string, user: SlugUser) {
  const parsed = parseUserParam(param)
  if ('id' in parsed) return parsed.id === user.id
  return !!user.domain && user.domain.toLowerCase() === parsed.domain
}

/**
 * For pages that only ever show the signed-in reader's own data (upload,
 * settings, ...):
 *
 * - signed out -> sign-in, returning to this very URL
 * - someone else's URL -> the same page under the reader's own slug
 *
 * `search` is the query string to carry along, with or without its `?`.
 */
export async function requireViewerRoute(
  userid: string,
  subpath: DashSection | (string & {}),
  search = ''
): Promise<Viewer> {
  const query = search && !search.startsWith('?') ? `?${search}` : search
  const viewer = await getViewer()
  if (!viewer) redirect(authHref(`/dash/${userid}/${subpath}${query}`))
  if (!isSameUser(userid, viewer))
    redirect(`/dash/${viewer.slug}/${subpath}${query}` as Route)
  return viewer
}
