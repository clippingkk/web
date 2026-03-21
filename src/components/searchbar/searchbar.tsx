import { Command, Search, XCircle } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useTranslation } from '@/i18n/client'

import { useSearchQueryLazyQuery } from '../../schema/generated'
import SearchClippingItem from './clipping-item'
import Empty from './empty'
import Loading from './loading'

type SearchBarProps = {
  visible: boolean
  onClose: () => void
  profile?: { id: number; domain: string }
}

function SearchBar(props: SearchBarProps) {
  const { visible, onClose, profile } = props
  const { t } = useTranslation()
  const [doQuery, { data, loading, called }] = useSearchQueryLazyQuery()
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [searchText, setSearchText] = useState('')

  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchText(value) // Update search text state immediately for UI purposes

      if (loading) {
        return
      }
      if (value.length < 2) {
        return
      }

      // Clear existing timeout if any
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }

      // Set a new timeout for 500ms
      throttleTimeoutRef.current = setTimeout(() => {
        doQuery({
          variables: {
            query: value,
          },
        })
      }, 500)
    },
    [doQuery, loading]
  )

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [visible])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  if (!visible) return null

  // Portal content that will be rendered to the body
  return (
    <div className="with-slide-in fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 md:pt-24">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="with-slide-in relative w-full max-w-xl overflow-hidden rounded-lg shadow-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        {/* Gradient border effect */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[2px]" />

        <div className="relative flex flex-col rounded-lg bg-white shadow-xl dark:bg-slate-900">
          {/* Search header */}
          <div className="flex items-center gap-2 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 dark:border-slate-700">
            <Search className="h-5 w-5 text-purple-500" aria-hidden="true" />
            <input
              ref={inputRef}
              onChange={onInputChange}
              type="search"
              className="w-full border-none bg-transparent text-lg outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white"
              placeholder={
                t('app.menu.search.placeholder') ?? 'Search for clippings...'
              }
            />
            <div className="flex items-center gap-2">
              <kbd className="hidden items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 sm:inline-flex dark:bg-slate-700 dark:text-slate-200">
                <Command className="mr-1 h-3 w-3" />K
              </kbd>
              <button
                onClick={onClose}
                className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close search"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search results */}
          <div className="max-h-[70vh] overflow-y-auto p-4">
            {called && !loading && data?.search.clippings.length === 0 && (
              <Empty />
            )}

            {loading && <Loading />}

            <ul className="space-y-3">
              {data?.search.clippings.map((c) => (
                <SearchClippingItem
                  key={c.id}
                  clipping={c}
                  profile={profile}
                  onClick={onClose}
                  highlightText={searchText}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = SearchBarProps

function SearchBarContainer(props: Props) {
  const { visible, ...rest } = props
  if (!visible) return null
  return createPortal(
    <SearchBar visible={visible} {...rest} />,
    document.querySelector('[data-id="modal"]') ?? document.body
  )
}

export default SearchBarContainer
