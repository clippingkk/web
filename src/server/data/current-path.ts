import 'server-only'
import { headers } from 'next/headers'

import { CK_PATH_HEADER } from '@/constants/headers'
import { isSameOriginPath } from '@/lib/auth-href'

/**
 * The path (with query) of the page being rendered, as forwarded by the proxy.
 * Falls back to `/` where the proxy did not run (API routes, static files) or
 * the header is not a same-origin path.
 */
export async function currentPath(): Promise<string> {
  const value = (await headers()).get(CK_PATH_HEADER)
  return isSameOriginPath(value) ? value : '/'
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * The part of a `/dash/[userid]/…` path after the user segment, plus its
 * search: `/dash/x/settings/orders?y` → `settings/orders` and `?y`. Compares
 * and slices the decoded path, so non-ASCII slugs line up and a malformed
 * escape can't throw.
 */
export function dashSubpath(path: string, userid: string, fallback: string) {
  const [pathname, search = ''] = path.split('?')
  const decoded = safeDecode(pathname)
  const prefix = `/dash/${safeDecode(userid)}/`
  const rest = decoded.startsWith(prefix) ? decoded.slice(prefix.length) : ''
  return { subpath: rest || fallback, search: search ? `?${search}` : '' }
}
