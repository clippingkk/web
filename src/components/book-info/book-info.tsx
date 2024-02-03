import React, { useCallback, useState } from 'react'
import Card from '../card/card';
import { WenquBook } from '../../services/wenqu'
import BlurhashView from '@annatarhe/blurhash-react'
// import Image from 'next/image'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp';
import { useTranslation } from 'react-i18next';
import HideUntilLoaded from '../SimpleAnimation/HideUntilLoaded'
import { Rating, Tooltip } from '@mantine/core';
import Preview from '../preview/preview3';
import BookSharePreview from '../preview/preview-book';
import { ShareIcon } from '@heroicons/react/24/solid';

type TBookInfoProp = {
  uid: number
  book: WenquBook
  duration?: number
  isLastReadingBook?: boolean
}

function BookInfo({ book, uid, duration, isLastReadingBook }: TBookInfoProp) {
  const { t } = useTranslation()
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible(v => !v)
  }, [])
  return (
    <Card className='mt-20 flex p-12 bg-blue-200 bg-opacity-50 flex-col md:flex-row'>
      <>
        <div className='mr-12 h-full'>
          <BlurhashView
            blurhashValue={book.edges?.imageInfo?.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
            src={book.image}
            height={384}
            width={320}
            className='shadow rounded mr-4 -mt-24 w-80 h-96 transition-all duration-300 max-w-xs'
            alt={book.title}
          />
        </div>

        <div className='font-lxgw text-slate-900 dark:text-slate-100'>
          <div className='flex items-center flex-column lg:flex-row'>
            <h2
              className='my-4 text-4xl font-bold mr-2 bg-gradient-to-r dark:from-orange-400 dark:to-sky-400 from-indigo-600 to-cyan-700 text-transparent bg-clip-text'
            >{book.title}</h2>
            <Tooltip
              withArrow
              label={`douban: ${book.rating ?? 0}/10`}
              transitionProps={{ transition: 'pop', duration: 200 }}
            >
              <Rating readOnly value={book.rating / 2} />
            </Tooltip>
          </div>
          <h5 className='my-4 text-2xl'>{book.author}</h5>
          {duration && (
            <h5 className='my-4 text-lg'>
              {t('app.book.readingDuration', {
                count: duration
              })}
            </h5>
          )}
          <button
            onClick={() => togglePreviewVisible()}
            className='bg-blue-400 hover:bg-blue-500 py-2 px-4 mb-2 rounded hover:shadow duration-300 transition-all flex items-center'
          >
            {t('app.book.share')}
            <ShareIcon className='w-4 h-4 ml-1' />
          </button>
          <p className='font-light leading-relaxed text-lg'>{book.summary}</p>
        </div>

        <BookSharePreview
          onCancel={togglePreviewVisible}
          onOk={togglePreviewVisible}
          background={book.image}
          opened={sharePreviewVisible}
          book={book}
          uid={uid}
        />
      </>
    </Card>
  )
}

export default BookInfo
