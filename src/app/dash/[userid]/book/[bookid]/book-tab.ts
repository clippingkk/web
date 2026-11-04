'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export type BookTab = 'highlights' | 'discussion'

/** Id of the tab list, so a link elsewhere on the page can scroll to it. */
export const BOOK_TABS_ID = 'book-tabs'

/**
 * The book page's open tab, kept in `?tab=` so a link (from the web or the
 * iOS app) can open the discussion. Switching uses `history.replaceState`,
 * which Next.js syncs with `useSearchParams` without a server round trip.
 */
export function useBookTab(): [BookTab, (tab: BookTab) => void] {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab: BookTab =
    searchParams.get('tab') === 'discussion' ? 'discussion' : 'highlights'

  const setTab = useCallback(
    (next: BookTab) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'discussion') params.set('tab', 'discussion')
      else params.delete('tab')
      const query = params.toString()
      window.history.replaceState(
        null,
        '',
        `${pathname}${query ? `?${query}` : ''}${window.location.hash}`
      )
    },
    [pathname, searchParams]
  )

  return [tab, setTab]
}
