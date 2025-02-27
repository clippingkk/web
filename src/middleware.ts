import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from './constants/storage'

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  // If going to the authentication page but already having a token and UID, just redirect to my home page.
  if (url.pathname.startsWith('/auth')) {
    if (request.cookies.has(COOKIE_TOKEN_KEY)) {
      const uid = request.cookies.get(USER_ID_KEY)?.value
      if (!uid) {
        return NextResponse.next()
      }
      const nextUrl = new URL(`/dash/${uid}/home`, request.url)
      nextUrl.protocol = url.protocol
      nextUrl.host = url.host
      nextUrl.port = url.port
      return NextResponse.redirect(nextUrl)
    }
  }
}
