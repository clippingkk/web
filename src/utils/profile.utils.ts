import type { Route } from 'next'

import { authHref } from '@/lib/auth-href'
import type { IN_APP_CHANNEL } from '@/services/channel'

/** Enough of a user to build their URL slug. */
export type SlugUser = { id: number; domain?: string | null }

/** A user, or a slug/id already taken from a URL. */
export type SlugSource = SlugUser | string | number

/**
 * The domain rule, shared with updateUserProfile on the server: 3-32 letters,
 * digits or dashes, not starting with a dash.
 */
export const DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]{2,31}$/i

/**
 * Whether a domain may stand in for the numeric id in `/dash/[userid]` URLs.
 * All-digit domains never qualify: `/dash/123` always means user 123. Legacy
 * domains that predate the rule (dots, one or two characters) fall back to the
 * id too.
 */
export function isUsableDomain(domain?: string | null): domain is string {
  return !!domain && DOMAIN_PATTERN.test(domain) && !/^\d+$/.test(domain)
}

/** The one slug for a user's URLs: their domain when usable, else their id. */
export function getUserSlug(user: SlugUser): string {
  return isUsableDomain(user.domain) ? user.domain : String(user.id)
}

function slugOf(source: SlugSource) {
  return encodeURIComponent(
    typeof source === 'object' ? getUserSlug(source) : String(source)
  )
}

/** Every page that lives directly under `/dash/[userid]`. */
export type DashSection =
  | 'home'
  | 'profile'
  | 'square'
  | 'upload'
  | 'unchecked'
  | 'comments'
  | 'admin'
  | 'settings/web'
  | 'settings/account'
  | 'settings/exports'
  | 'settings/orders'
  | 'settings/webhooks'

export function dashHref(user: SlugSource, section: DashSection = 'home') {
  return `/dash/${slugOf(user)}/${section}` as Route
}

export function clippingHref(
  creator: SlugSource,
  id: number | string,
  iac?: IN_APP_CHANNEL | string
) {
  const query = iac === undefined ? '' : `?iac=${encodeURIComponent(iac)}`
  return `/dash/${slugOf(creator)}/clippings/${encodeURIComponent(id)}${query}` as Route
}

export function bookHref(user: SlugSource, doubanId: string) {
  return `/dash/${slugOf(user)}/book/${encodeURIComponent(doubanId)}` as Route
}

export function getMyHomeLink(user?: SlugUser, next?: string): Route {
  return user ? dashHref(user, 'home') : authHref(next)
}
