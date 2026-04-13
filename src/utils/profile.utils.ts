import type { ProfileQuery } from '@/schema/generated'

export function getUserSlug(
  p: Pick<ProfileQuery['me'], 'id' | 'domain'>
): string | number {
  return p.domain.length > 2 ? p.domain : p.id
}

export function getMyHomeLink(p?: Pick<ProfileQuery['me'], 'id' | 'domain'>) {
  if (!p) {
    return '/auth/auth-v4'
  }
  return `/dash/${getUserSlug(p)}/home`
}
