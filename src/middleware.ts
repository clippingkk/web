import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from './constants/storage'

export function middleware(request: NextRequest) {
  const url = new URL(request.url)

  if (!url.pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  if (!request.cookies.has(COOKIE_TOKEN_KEY)) {
    return NextResponse.next()
  }

  // If going to the authentication page but already having a token and UID, just redirect to my home page.
  const uid = request.cookies.get(USER_ID_KEY)?.value
  if (!uid) {
    return NextResponse.next()
  }
  if (
    uid &&
    !url.pathname.includes('callback') &&
    url.searchParams.has('clean')
  ) {
    request.cookies.delete(COOKIE_TOKEN_KEY)
    request.cookies.delete(USER_ID_KEY)
    return NextResponse.next()
  }
  const nextUrl = new URL(`/dash/${uid}/home`, request.url)
  nextUrl.protocol = url.protocol
  nextUrl.host = url.host
  nextUrl.port = url.port
  return NextResponse.redirect(nextUrl)
}
