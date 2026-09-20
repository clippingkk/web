import { metrics, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { GraphQLError } from 'graphql'
import { NextResponse } from 'next/server'

import { ApiError } from '@/server/errors'
import { gateConfig } from '@/server/gate/config'
import { exchangeCode } from '@/server/gate/oidc'
import {
  cookie,
  cookieValue,
  SESSION_COOKIE,
  safeNext,
} from '@/server/gate/security'
import {
  createSession,
  destroySession,
  SESSION_TTL,
} from '@/server/gate/session'
import { ensureLocalUser, provisionMember } from '@/server/gate/user'
import { verifyIdToken } from '@/server/gate/verify'
import { route } from '@/server/http'
import { getRedis } from '@/server/redis'
const outcomes = metrics
  .getMeter('clippingkk.auth')
  .createCounter('auth.login.outcomes')
const logger = logs.getLogger('clippingkk.auth')
export const GET = route(async (request) => {
  const params = new URL(request.url).searchParams
  const state = params.get('state') ?? ''
  let response: NextResponse
  try {
    if (!/^[\w-]{43}$/.test(state))
      throw new ApiError('Login expired. Please try again.', 400)
    const redis = await getRedis()
    // Compare browser binding and consume atomically; mismatched callbacks cannot burn another attempt.
    const raw = await redis.eval(
      "local v = redis.call('GET', KEYS[1]); if not v then return nil end; if cjson.decode(v).browser ~= ARGV[1] then return nil end; redis.call('DEL', KEYS[1]); return v",
      {
        keys: [`ck:oidc:${state}`],
        arguments: [cookieValue(request, 'ck-oidc')],
      }
    )
    if (typeof raw !== 'string')
      throw new ApiError('Login expired. Please try again.', 400)
    const attempt = JSON.parse(raw) as {
      verifier: string
      nonce: string
      next: string | null
    }
    if (params.has('error') || !params.get('code'))
      throw new ApiError('Sign-in was cancelled. Please try again.', 400)
    const tokens = await exchangeCode({
      code: params.get('code')!,
      verifier: attempt.verifier,
    })
    const identity = await verifyIdToken(tokens.idToken, attempt.nonce)
    const user = await ensureLocalUser(identity)
    await provisionMember(user.id)
    const session = await createSession({
      localUserId: user.id,
      gateUserId: identity.gateUserId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: Date.now() + tokens.expiresIn * 1000,
    })
    const previous = cookieValue(request)
    if (previous) await destroySession(previous)
    response = NextResponse.redirect(
      new URL(
        safeNext(attempt.next) ?? `/dash/${user.id}/home`,
        gateConfig().appOrigin
      )
    )
    response.headers.append(
      'Set-Cookie',
      cookie(SESSION_COOKIE, session.id, SESSION_TTL)
    )
    outcomes.add(1, { outcome: 'success' })
  } catch (error) {
    outcomes.add(1, { outcome: 'failure' })
    const code = error instanceof ApiError ? error.code : 'LOGIN_FAILED'
    const message = error instanceof Error ? error.message : String(error)
    const gate =
      error instanceof GraphQLError
        ? {
            'gate.error': String(error.extensions.gateError ?? ''),
            'gate.status': Number(error.extensions.code ?? 0),
          }
        : undefined
    // This catch returns a redirect, so route()'s error path never sees the
    // failure. Record it here or the cause is lost: every Gate rejection
    // otherwise collapses to LOGIN_FAILED and the generic auth-card message.
    trace
      .getActiveSpan()
      ?.recordException(
        error instanceof Error ? error : new Error(String(error))
      )
    logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: 'Gate sign-in callback failed',
      attributes: {
        operation: 'auth.gate.callback',
        'error.code': code,
        'error.message': message,
        ...gate,
      },
    })
    // Also to stderr. The record above only reaches the OTel collector, so with
    // no collector -- or no access to one -- a failing login leaves container
    // logs completely silent, which is how a misconfigured Gate audience stayed
    // invisible while every sign-in failed.
    console.error('Gate sign-in callback failed', { code, message, ...gate })
    response = NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(code)}`, gateConfig().appOrigin)
    )
  }
  response.headers.append('Set-Cookie', cookie('ck-oidc', '', 0))
  for (const name of ['ck-token', 'ck-uid'])
    response.headers.append('Set-Cookie', cookie(name, '', 0))
  response.headers.set('Cache-Control', 'no-store')
  return response
}, 'auth.gate.callback')
