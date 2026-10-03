import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { checkIsPremium } from '@/compute/user'
import { ViewerDocument, type ViewerQuery } from '@/gql/graphql'
import { authHref } from '@/lib/auth-href'
import { canAdmin } from '@/server/gate/authz'
import { currentUserId } from '@/server/gate/current'
import { getUserSlug } from '@/utils/profile.utils'

import { currentPath } from './current-path'
import { serverQuery } from './query'

export type Viewer = ViewerQuery['me'] & {
  /** The segment for this reader's own `/dash/[userid]` URLs. */
  slug: string
  isPremium: boolean
  isAdmin: boolean
}

/**
 * The signed-in reader, or null. Cached per request, so every component that
 * asks shares one lookup.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const id = await currentUserId()
  if (!id) return null
  const [data, isAdmin] = await Promise.all([
    // A session the API no longer accepts is "signed out" here, not a
    // redirect: public pages call this too.
    serverQuery(
      ViewerDocument,
      { id },
      { notFound: 'null', unauthorized: 'null' }
    ),
    canAdmin(id),
  ])
  if (!data) return null
  const { me } = data
  return {
    ...me,
    slug: getUserSlug(me),
    isPremium: checkIsPremium(me.premiumEndAt),
    isAdmin,
  }
})

/**
 * The signed-in reader, or a redirect to sign-in that returns to `next`
 * (default: the page being rendered).
 */
export async function requireViewer(next?: string): Promise<Viewer> {
  const viewer = await getViewer()
  if (!viewer) redirect(authHref(next ?? (await currentPath())))
  return viewer
}
