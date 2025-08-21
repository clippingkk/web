'use client'
import BlurhashView from '@annatarhe/blurhash-react'
import Modal from '@annatarhe/lake-ui/modal'
import download from 'downloadjs'
import { toPng } from 'html-to-image'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from '@/components/button/button'
import SpinnerIcon from '@/components/loading/spinner'
import PublicBookItem from '@/components/public-book-item/public-book-item'
import { useBookSearch, useSingleBook } from '@/hooks/book'
import { toastPromiseDefaultOption } from '@/services/misc'

function FavBookCard(props: {
  k: string
  dbid: number
  onChange: (dbid: number) => void
}) {
  const { k, dbid, onChange } = props
  const b = useSingleBook(dbid.toString())
  const [selecting, setSelecting] = useState(false)
  const [searchingText, setSearchingText] = useState('')

  const bs = useBookSearch(searchingText, 0)

  return (
    <div className='mx-auto w-96'>
      <div className='flex h-144 flex-col rounded-sm'>
        <div
          className={`relative flex-1 border-2 ${dbid > 0 ? 'border-transparent' : 'border-gray-400 dark:border-gray-100'}`}
          onClick={() => setSelecting((p) => !p)}
        >
          <div className='bg-opacity-60 absolute top-0 right-0 left-0 z-10 bg-gray-700 pt-2 pr-2 pb-2 backdrop-blur-sm'>
            <h4 className='text-right text-xl text-gray-100'>{k}</h4>
          </div>
          {b ? (
            <div
              className={
                'with-slide-in relative transform rounded-sm shadow-2xl transition-all duration-300 hover:scale-110'
              }
            >
              <BlurhashView
                blurhashValue={
                  b.edges?.imageInfo?.blurHashValue ??
                  'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
                }
                src={b.image}
                height={576}
                width={320}
                className='h-144 w-full rounded-sm object-cover'
                alt={b.title}
              />
              <div
                className={
                  'bg-opacity-60 absolute bottom-0 left-0 w-full rounded-b bg-gray-700 px-4 py-8 text-white backdrop-blur-2xl'
                }
              >
                <h2 className='text-right text-2xl'>{b.title}</h2>
                <h3 className='line-clamp-2 text-right text-sm italic'>
                  {b.author}
                </h3>
              </div>
            </div>
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <Button
                variant='primary'
                className='bg-gradient-to-br from-indigo-300 to-cyan-600 after:from-indigo-300/40 after:to-cyan-600/40'
              >
                Select one
              </Button>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={selecting} onClose={() => setSelecting(false)} title={k}>
        <div>
          <input
            type='search'
            placeholder='输入书名开始搜索'
            value={searchingText}
            onChange={(e) => setSearchingText(e.target.value.trim())}
            // rightSection={<span>🔍</span>}
          />
          <ul
            className='relative mt-8 grid grid-cols-3 overflow-y-auto'
            style={{
              height: '70vh',
            }}
          >
            {bs.data?.books.map((x) => (
              <div
                onClick={() => {
                  onChange(x.doubanId)
                  setSearchingText('')
                  setSelecting(false)
                }}
                key={x.id}
              >
                <PublicBookItem book={x} />
              </div>
            ))}
            {bs.isLoading && (
              <div className='absolute inset-0 flex h-full w-full items-center justify-center'>
                <SpinnerIcon />
              </div>
            )}
            {!bs.data?.books.length && !bs.isLoading && (
              <div className='absolute inset-0 flex h-full w-full items-center justify-center'>
                <span>
                  {searchingText === '' ? '输入书名开始搜索' : '无内容'}
                </span>
              </div>
            )}
          </ul>
        </div>
      </Modal>
    </div>
  )
}

function ReportFavouritesPage() {
  const [records, setRecords] = useState<{ [k: string]: number }>({
    最爱的: -1,
    最影响我的: -1,
    最快乐的: -1,
    最想安利的: -1,
    最爽快的: -1,
    最致郁的: -1,
    最被低估的: -1,
    最被高估的: -1,
    最震撼的: -1,
  })

  const contentDOM = useRef<HTMLDivElement>(null)

  const onShareImage = useCallback(async () => {
    if (!contentDOM.current) {
      return
    }

    return toast.promise(
      toPng(contentDOM.current).then((res) =>
        download(res, 'my-favourites-books.png')
      ),
      toastPromiseDefaultOption
    )
  }, [])

  return (
    <div className='anna-page-container h-min-screen flex w-full items-center justify-center bg-cover bg-center bg-no-repeat'>
      <div className='dark:bg-opacity-80 bg-opacity-60 min-h-screen w-full bg-gray-400 backdrop-blur-xl dark:bg-gray-900'>
        <div ref={contentDOM} className='container mx-auto mt-8 pb-20'>
          <h1 className='font-lxgw mb-8 text-center text-4xl dark:text-gray-100'>
            阅读喜好表
          </h1>
          <div className='font-lxgw grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 dark:text-gray-100'>
            {Object.keys(records).map((k) => (
              <FavBookCard
                dbid={records[k]}
                k={k}
                key={k}
                onChange={(bid) => {
                  setRecords((prev) => ({ ...prev, [k]: bid }))
                }}
              />
            ))}
          </div>
        </div>

        <div className='fixed top-6 right-6'>
          <Button
            className='rounded-full bg-gradient-to-br from-indigo-400 to-cyan-500 after:from-indigo-400/40 after:to-cyan-500/40'
            variant='primary'
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
