import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '../../store'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { UserContent } from '../../store/user/type'
import { useSearchQueryLazyQuery } from '../../schema/generated'
import { Input, Modal } from '@mantine/core'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'

type SearchBarProps = {
  visible: boolean
  onClose: () => void
}

export function useCtrlP() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // For Ctrl+P (Windows/Linux) or Cmd+P (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault(); // Prevent browser's print dialog
        setVisible(true);
      }
      // For Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [])

  useEffect(() => {
    if (visible) {
      disableBodyScroll(document.body)
    } else {
      enableBodyScroll(document.body)
    }
  }, [visible])

  return {
    visible,
    setVisible
  }
}

function SearchBar(props: SearchBarProps) {
  const { visible } = props
  const { t } = useTranslation()
  const [doQuery, { data, loading, called }] = useSearchQueryLazyQuery()
  const profile = useSelector<TGlobalStore, UserContent>(s => s.user.profile)

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (loading) {
      return
    }
    if (value.length < 2) {
      return
    }

    doQuery({
      variables: {
        query: value
      }
    })
  }, [doQuery, loading])

  return (
    <Modal
      opened={visible}
      onClose={props.onClose}
      closeOnClickOutside
      size='xl'
      closeOnEscape
      centered
      withCloseButton={false}
      className='dark:bg-slate-900 bg-slate-100'
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 4,
      }}
    >
      <Input
        onChange={onInputChange}
        size='xl'
        type='search'
        autoFocus
        placeholder={t('app.menu.search.placeholder') ?? ''}
        leftSection={
          <MagnifyingGlassIcon className='w-6 h-6' />
        }
      />
      <div className='flex flex-col flex-1 container'>
        {called && !loading && data?.search.clippings.length === 0 && (
          <div className='w-full flex items-center justify-center py-8 flex-col'>
            <span className='text-5xl mb-4'>😭</span>
            <span className='text-base dark:text-gray-100'>{t('app.menu.search.empty')}</span>
          </div>
        )}
        <ul className='list-none overflow-y-auto py-4 mx-8 lg:mx-0' style={{
          maxHeight: '80vh'
        }}>
          {data?.search.clippings.map(c => (
            <li
              className='dark:bg-slate-800 bg-slate-400 mt-4 list-none dark:hover:bg-slate-900 hover:bg-slate-500 with-slide-in rounded-sm duration-150 transition-all active:scale-95'
              key={c.id}
            >
              <Link
                href={`/dash/${profile.domain.length > 3 ? profile.domain : profile.id}/clippings/${c.id}`}
                className='block py-8 px-4'
                onClick={props.onClose}>
                <p className='text-xl leading-normal'>{c.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}

export default SearchBar
