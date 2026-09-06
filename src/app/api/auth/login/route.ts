import { NextResponse } from 'next/server'

import {
  createPkcePair,
  randomToken,
  buildAuthorizationUrl,
} from '@/server/gate/oidc'
import { cookie, safeNext } from '@/server/gate/security'
import { route } from '@/server/http'
import { cacheSet } from '@/server/redis'
export const GET = route(async (request) => {
  const { verifier, challenge } = createPkcePair()
  const state = randomToken(),
    nonce = randomToken(),
    browser = randomToken()
  await cacheSet(
    `ck:oidc:${state}`,
    {
      verifier,
      nonce,
      browser,
      next: safeNext(new URL(request.url).searchParams.get('next')),
    },
    600
  )
  const response = NextResponse.redirect(
    buildAuthorizationUrl({ state, nonce, challenge })
  )
  response.headers.append('Set-Cookie', cookie('ck-oidc', browser, 600))
  response.headers.set('Cache-Control', 'no-store')
  return response
}, 'auth.gate.login')
