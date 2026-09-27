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
