import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  // If going to the authentication page but already having a token and UID, just redirect to my home page.
  if (url.pathname.startsWith('/auth')) {
    if (request.cookies.has('token')) {
      const uid = request.cookies.get('uid')?.value
      if (uid) {
        return NextResponse.redirect(new URL(`/dash/${uid}/home`, request.url));
      }
    }
  }
}
