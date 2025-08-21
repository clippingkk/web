import type { ProfileQuery } from '@/schema/generated'

export function getMyHomeLink(p?: Pick<ProfileQuery['me'], 'id' | 'domain'>) {
  if (!p) {
    return '/auth/auth-v4'
  }
  const id = p.domain.length > 2 ? p.domain : p.id
  return `/dash/${id}/home`
}
