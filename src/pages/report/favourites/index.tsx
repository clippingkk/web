import { Button, Input, Modal } from '@mantine/core'
import Head from 'next/head'
import React, { useCallback, useRef, useState } from 'react'
import BookCover from '../../../components/book-cover/book-cover'
import OGWithIndex from '../../../components/og/og-with-index'
import OGWithReport from '../../../components/og/og-with-report'
import PublicBookItem from '../../../components/public-book-item/public-book-item'
import { useBookSearch, useSingleBook } from '../../../hooks/book'
import { wenquRequest, WenquSearchResponse } from '../../../services/wenqu'
import SpinnerIcon from '../../../components/loading/spinner'

import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../services/misc'

type ReportFavouritesPageProps = {
}

function FavBookCard(
  props: {
    k: string,
    dbid: number,
    onChange: (dbid: number) => void
  }) {
  const { k, dbid, onChange } = props
  const b = useSingleBook(dbid.toString())
  const [selecting, setSelecting] = useState(false)
  const [searchingText, setSearchingText] = useState('')

  const bs = useBookSearch(searchingText, 0)

  return (
    <div className='w-96 mx-auto'>
      <div className='h-144 rounded flex flex-col'>
        <div
          className={`flex-1 relative border-2 ${dbid > 0 ? 'border-transparent' : 'dark:border-gray-100 border-gray-400'}`}
          onClick={() => setSelecting(p => !p)}
        >
          <div className='pr-2 pb-2 pt-2 absolute top-0 left-0 right-0 z-10 backdrop-blur bg-gray-700 bg-opacity-60'>
            <h4 className=' text-xl text-right text-gray-100'>{k}</h4>
          </div>
          {b ? (
            <div className={'relative transition-all duration-300 rounded transform hover:scale-110 shadow-2xl with-slide-in'}>
              <img
                src={b.image}
                className='object-cover rounded w-full h-144'
              />
              <div className={'absolute bottom-0 left-0 w-full py-8 px-4 text-white rounded-b backdrop-blur-2xl bg-gray-700 bg-opacity-60'}>
                <h2 className='text-2xl text-right'>{b.title}</h2>
                <h3 className='text-sm italic text-right line-clamp-2'>{b.author}</h3>
              </div>
            </div>
          ) : (
            <div className='h-full w-full flex justify-center items-center'>
              <Button
                variant='gradient'
                className=' bg-gradient-to-br from-indigo-300 to-cyan-600'
              >
                Select one
              </Button>
            </div>
          )}
        </div>
      </div>
      <Modal
        opened={selecting}
        onClose={() => setSelecting(false)}
        title={k}
        centered
        size='xl'
        overlayProps={{
          blur: 4
        }}
      >
        <div>
          <Input
            placeholder="输入书名开始搜索"
            value={searchingText}
            onChange={e => setSearchingText(e.target.value.trim())}
            rightSection={
              <span>🔍</span>
            }
          />
          <ul
            className='grid grid-cols-3 overflow-y-auto mt-8 relative'
            style={{
              height: '70vh'
            }}
          >
            {bs.data?.books.map(x => (
              <div
                onClick={() => {
                  onChange(x.doubanId)
                  setSearchingText('')
                  setSelecting(false)
                }}
                key={x.id} >
                <PublicBookItem book={x} />
              </div>
            ))}
            {bs.isLoading && (
              <div className=' absolute inset-0 w-full h-full flex justify-center items-center'>
                <SpinnerIcon />
              </div>
            )}
            {!bs.data?.books.length && !bs.isLoading && (
              <div className=' absolute inset-0 w-full h-full flex justify-center items-center'>
                <span>
                  {searchingText === '' ? '输入书名开始搜索' : '无内容'}</span>
              </div>
            )}
          </ul>
        </div>
      </Modal>
    </div>
  )
}

function ReportFavouritesPage(props: ReportFavouritesPageProps) {
  const [records, setRecords] = useState<{ [k: string]: number }>({
    '最爱的': -1,
    '最影响我的': -1,
    '最快乐的': -1,
    '最想安利的': -1,
    '最爽快的': -1,
    '最致郁的': -1,
    '最被低估的': -1,
    '最被高估的': -1,
    '最震撼的': -1,
  })

  const contentDOM = useRef<HTMLDivElement>(null)

  const onShareImage = useCallback(async () => {
    if (!contentDOM.current) {
      return
    }

    return toast.promise(
      toPng(contentDOM.current).then(res =>
        download(res, 'my-favourites-books.png')
      )
      , toastPromiseDefaultOption)
  }, [])

  return (
    <div
      className='w-full anna-page-container flex justify-center items-center h-min-screen bg-no-repeat bg-cover bg-center'
    >
      <Head>
        <title>My favourites books</title>
        <OGWithIndex />
      </Head>
      <div className='w-full min-h-screen backdrop-blur-xl bg-gray-400 dark:bg-gray-900 dark:bg-opacity-80 bg-opacity-60'>
        <div
          ref={contentDOM}
          className='container mx-auto mt-8 pb-20'
        >
          <h1 className=' text-4xl mb-8 text-center dark:text-gray-100 font-lxgw'>阅读喜好表</h1>
          <div className=' grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 dark:text-gray-100 font-lxgw gap-4'>
            {Object.keys(records).map((k) => (
              <FavBookCard
                dbid={records[k]}
                k={k}
                key={k}
                onChange={bid => {
                  setRecords(prev => ({ ...prev, [k]: bid }))
                }}
              />
            ))}
          </div>
        </div>

        <div className='fixed right-6 top-6'>
          <Button
            className=' rounded-full bg-gradient-to-br from-indigo-400 to-cyan-500'
            onClick={onShareImage}
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReportFavouritesPage
