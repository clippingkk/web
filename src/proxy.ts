import { NextResponse, type NextRequest } from 'next/server'

import { CK_PATH_HEADER } from '@/constants/headers'

/**
 * Forwards the page's own path to server components (see currentPath()) so a
 * redirect to sign-in can say where to come back to. It never redirects: auth
 * is decided by the verified session, not by anything readable here.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers)
  // `set`, not `append`: a client-supplied value must never survive.
  headers.set(
    CK_PATH_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: [
    // Pages only: skip API routes, Next internals and files with an extension.
    // Extensions are listed because legacy profile domains may contain a dot.
    '/((?!api(?:/|$)|_next/|.*\\.(?:ico|png|jpe?g|gif|svg|webp|avif|txt|xml|json|webmanifest|js|mjs|css|map|woff2?|ttf|otf|mp4|webm|pdf)$).*)',
  ],
}
