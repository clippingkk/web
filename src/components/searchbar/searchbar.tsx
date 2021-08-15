import { useLazyQuery } from '@apollo/client'
import { Link } from '@reach/router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import searchQueryDoc from '../../schema/search.graphql'
import { searchQuery, searchQueryVariables } from '../../schema/__generated__/searchQuery'
import { TGlobalStore } from '../../store'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { useTranslation } from 'react-i18next'
import { debounce } from '../../utils/debounce'

type SearchBarProps = {
}

function useCtrlP() {
  const [visible, setVisible] = useState(false)
  const searchDOM = useRef<HTMLInputElement>(null)
  const onKeyRelease = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.code === 'KeyP') {
      e.stopPropagation()
      e.preventDefault()
      setVisible(true)
      setTimeout(() => {
        if (searchDOM.current) {
          searchDOM.current.focus()
        }
      }, 100)
      return false
    }
  }, [])
  const onKeyEscape = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      e.stopPropagation()
      e.preventDefault()
      setVisible(false)
      return false
    }
  }, [])
  useEffect(() => {
    document.body.addEventListener('keydown', onKeyRelease)
    document.body.addEventListener('keydown', onKeyEscape)
    return () => {
      document.body.removeEventListener('keydown', onKeyRelease)
      document.body.removeEventListener('keydown', onKeyEscape)
    }
  }, [])

  useEffect(() => {
    if (visible) {
      disableBodyScroll(document.body)
    } else {
      enableBodyScroll(document.body)
    }
  }, [visible])

  return {
    searchDOM,
    visible,
    setVisible
  }
}

function SearchBar(props: SearchBarProps) {
  const { searchDOM, visible, setVisible } = useCtrlP()
  const { t } = useTranslation()
  const [doQuery, { data, loading, called }] = useLazyQuery<searchQuery, searchQueryVariables>(searchQueryDoc)
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const noop = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    return
  }, [])

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
  }, [doQuery])

  if (!visible) {
    return null
  }

  return (
    <div
      className='fixed top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-40 flex-col backdrop-blur-lg with-fade-in'
      onClick={() => {
        setVisible(false)
      }}
    >
      <div className='w-full items-center flex flex-col max-h-screen'>
        <div className='p-4 container flex justify-center items-center mt-10' onClick={noop}>
          <label htmlFor="search" className='text-4xl bg-white p-8 pr-2 rounded-l dark:bg-gray-300' >🔍</label>
          <input
            type="text"
            name='search'
            className='w-80 lg:w-1/3 py-8 px-4 rounded-r focus:outline-none text-4xl dark:bg-gray-300'
            ref={searchDOM}
            onChange={debounce(onInputChange, 300)}
          />
        </div>
        <div className='flex flex-col w-80 lg:w-1/3 flex-1' onClick={noop}>
          {called && !loading && data?.search.clippings.length === 0 && (
            <div className='w-full bg-gray-300 flex items-center justify-center py-8 flex-col'>
              <span className='text-5xl mb-4'>😭</span>
              <span className='text-base'>{t('app.menu.search.empty')}</span>
            </div>
          )}
          <ul className='list-none'>
            {data?.search.clippings.map(c => (
              <li
                className='dark:bg-gray-300 bg-gray-400 mt-4 list-none with-fade-in'
                key={c.id}
              >
                <Link
                  to={`/dash/${uid}/clippings/${c.id}`}
                  className='block py-8 px-4 rounded dark:bg-gray-300 bg-gray-400 hover:bg-gray-200 transform hover:scale-105 duration-150'
                  onClick={() => {
                    setVisible(false)
                  }}
                >
                  <p className='text-xl leading-normal'>{c.content}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SearchBar
