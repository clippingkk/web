import type { Route } from 'next'

/**
 * True for a path on this origin: `/dash/1/home?tab=books`, never `//evil.test`,
 * `/\evil.test` (browsers treat the backslash as a slash) or anything carrying
 * whitespace/control characters. The sign-in page re-validates with safeNext()
 * before it follows the value, so this only keeps obviously foreign values from
 * ever being written into a link.
 */
export function isSameOriginPath(value?: string | null): value is string {
  return (
    !!value &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    ![...value].some((char) => char.charCodeAt(0) <= 32)
  )
}

/** Sign-in and API paths are never a useful place to come back to. */
const NON_RETURNABLE = /^\/(?:auth|api)(?:[/?#]|$)/

/**
 * The one way to link or redirect to sign-in. `next` is where the reader
 * returns afterwards; anything that is not a same-origin page path is dropped,
 * and the reader lands on their dashboard instead.
 */
export function authHref(next?: string | null): Route {
  if (!isSameOriginPath(next) || NON_RETURNABLE.test(next)) return '/auth'
  return `/auth?next=${encodeURIComponent(next)}` as Route
}
