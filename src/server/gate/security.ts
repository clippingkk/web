import { ApiError } from '../errors'
import { gateConfig } from './config'
export const SESSION_COOKIE = 'ck-session'
export function cookieValue(request: Request, name = SESSION_COOKIE) {
  return (
    request.headers
      .get('cookie')
      ?.split(';')
      .map((x) => x.trim())
      .find((x) => x.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? ''
  )
}
export function safeNext(value: string | null) {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    [...value].some((char) => char.charCodeAt(0) <= 32) ||
    value.includes('\\')
  )
    return null
  const url = new URL(value, gateConfig().appOrigin)
  if (
    url.origin !== new URL(gateConfig().appOrigin).origin ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/api/')
  )
    return null
  return `${url.pathname}${url.search}${url.hash}`
}
export function assertSameOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(gateConfig().appOrigin).origin)
    throw new ApiError('Request origin rejected', 403, 'FORBIDDEN')
}
export function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}
