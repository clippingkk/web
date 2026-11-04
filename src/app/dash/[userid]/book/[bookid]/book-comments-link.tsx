'use client'

import type React from 'react'

import { BOOK_TABS_ID, useBookTab } from './book-tab'

type BookCommentsLinkProps = {
  children: React.ReactNode
}

/** "12 comments" in the book header: opens the Discussion tab. */
function BookCommentsLink({ children }: BookCommentsLinkProps) {
  const [, setTab] = useBookTab()

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // let modified clicks open the link in a new tab as usual
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setTab('discussion')
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    document
      .getElementById(BOOK_TABS_ID)
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <a
      href="?tab=discussion"
      onClick={onClick}
      className="text-lake-accent-text focus-visible:ring-lake-ring rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2"
    >
      {children}
    </a>
  )
}

export default BookCommentsLink
