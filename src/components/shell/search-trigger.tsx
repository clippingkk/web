'use client'

import Kbd from '@annatarhe/lake-ui/kbd'
import { Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from '@/i18n/client'

import type { ShellViewer } from './types'

const SearchBar = dynamic(() => import('@/components/searchbar/searchbar'), {
  ssr: false,
})

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

type SearchTriggerProps = {
  viewer: ShellViewer
}

function SearchTrigger({ viewer }: SearchTriggerProps) {
  const { t } = useTranslation(undefined, 'common')
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      const isSlash =
        event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey
      if (isShortcut || (isSlash && !isEditableTarget(event.target))) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('shell.search.open')}
        aria-keyshortcuts="Meta+K Control+K"
        className="rounded-lake-control border-lake-line bg-lake-surface text-lake-fg-subtle hover:border-lake-line-strong hover:text-lake-fg focus-visible:ring-lake-ring inline-flex h-9 items-center gap-2 border px-2.5 text-sm transition-colors duration-150 outline-none focus-visible:ring-2 sm:w-56 sm:justify-between"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t('shell.search.open')}</span>
        </span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </button>
      {open ? (
        <SearchBar
          visible={open}
          onClose={onClose}
          profile={{ id: viewer.id, domain: viewer.slug }}
        />
      ) : null}
    </>
  )
}

export default SearchTrigger
