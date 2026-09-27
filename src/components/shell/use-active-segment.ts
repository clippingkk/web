'use client'

import { useParams, useSelectedLayoutSegment } from 'next/navigation'
import { useCallback } from 'react'

import type { ShellNavSegment } from './nav-items'

type ViewerIdentity = { id: number; slug: string }

function decodeSlug(raw: string) {
  try {
    return decodeURIComponent(raw)
  } catch {
    // a malformed escape (`/dash/50%/home`) must not take the shell down
    return raw
  }
}

/**
 * A nav item is active when its segment is showing *for the viewer*: looking
 * at someone else's library should not light up "Library". The square is
 * global, so it is active under any user slug.
 */
export function useActiveSegment(viewer: ViewerIdentity | null) {
  const segment = useSelectedLayoutSegment()
  const params = useParams<{ userid?: string }>()
  const pathUser = params?.userid ? decodeSlug(params.userid) : null
  const isOwnPath =
    !!viewer &&
    !!pathUser &&
    (pathUser.toLowerCase() === viewer.slug.toLowerCase() ||
      pathUser === String(viewer.id))

  return useCallback(
    (target: ShellNavSegment) => {
      if (segment !== target) return false
      return target === 'square' || isOwnPath
    },
    [segment, isOwnPath]
  )
}
