import React from 'react'
import Card from '../card/card';
import { WenquBook } from '../../services/wenqu'
import BlurhashView from '@annatarhe/blurhash-react'
// import Image from 'next/image'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp';
import { useTranslation } from 'react-i18next';
import HideUntilLoaded from '../SimpleAnimation/HideUntilLoaded'
import { Rating, Tooltip } from '@mantine/core';

type TBookInfoProp = {
  uid: number
  book: WenquBook
  duration?: number
  isLastReadingBook?: boolean
}

function BookInfo({ book, uid, duration, isLastReadingBook }: TBookInfoProp) {
  const { t } = useTranslation()
  return (
    <Card className='mt-20 flex p-12 bg-blue-200 bg-opacity-50 flex-col md:flex-row'>
      <React.Fragment>
        <div className='mr-12 w-full h-full'>
          <BlurhashView
            blurhashValue={book.edges?.imageInfo.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
            src={book.image}
            height={384}
            width={320}
            className='shadow rounded mr-4 -mt-24 w-80 h-96 transition-all duration-300 max-w-xs'
            alt={book.title}
          />
        </div>

        <div className='font-lxgw'>
          <div className='flex items-center flex-column lg:flex-row'>
            <h2 className='my-4 text-4xl font-bold mr-2'>{book.title}</h2>
            <Tooltip label={`douban: ${book.rating}/10`}>
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
          <a
            href={getUTPLink(UTPService.book, { uid, bid: book.id, theme: KonzertThemeMap.dark.id, })}
            target='_blank'
            className='bg-blue-400 py-2 px-4 mb-2 inline-block hover:underline' rel="noreferrer"
          >
            {t('app.book.share')}
          </a>
          <p className='font-light leading-relaxed text-lg'>{book.summary}</p>
        </div>
      </React.Fragment>
    </Card>
  )
}

export default BookInfo
