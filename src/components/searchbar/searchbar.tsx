import { useLazyQuery } from '@apollo/client/react'
import { Command, Search, XCircle } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SearchQueryDocument, type SearchQueryQuery } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
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
  const [doQuery, { data, loading, called }] =
    useLazyQuery<SearchQueryQuery>(SearchQueryDocument)
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
    <div className='fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 md:pt-24 with-slide-in'>
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        ref={modalRef}
        className='w-full max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl relative rounded-lg shadow-2xl overflow-hidden with-slide-in'
        role='dialog'
        aria-modal='true'
        aria-labelledby='search-modal-title'
      >
        {/* Gradient border effect */}
        <div className='absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[2px] rounded-lg pointer-events-none' />

        <div className='relative bg-white dark:bg-slate-900 rounded-lg shadow-xl flex flex-col'>
          {/* Search header */}
          <div className='flex items-center gap-2 p-3 border-b dark:border-slate-700 bg-gradient-to-r from-indigo-500/10 to-purple-500/10'>
            <Search className='w-5 h-5 text-purple-500' aria-hidden='true' />
            <input
              ref={inputRef}
              onChange={onInputChange}
              type='search'
              className='w-full bg-transparent border-none outline-none text-lg placeholder:text-slate-400 dark:text-white focus:ring-0'
              placeholder={
                t('app.menu.search.placeholder') ?? 'Search for clippings...'
              }
            />
            <div className='flex items-center gap-2'>
              <kbd className='hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded'>
                <Command className='w-3 h-3 mr-1' />K
              </kbd>
              <button
                onClick={onClose}
                className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
                aria-label='Close search'
              >
                <XCircle className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Search results */}
          <div className='overflow-y-auto max-h-[70vh] p-4'>
            {called && !loading && data?.search.clippings.length === 0 && (
              <Empty />
            )}

            {loading && <Loading />}

            <ul className='space-y-3'>
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
