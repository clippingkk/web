import React from 'react'
import { HideUntilLoaded } from '@nearform/react-animation'
import { IBook, searchBookDetail, getBookClippings } from '../../services/books';
import Card from '../card/card';
import { WenquBook } from '../../services/wenqu'
import { Link } from '@reach/router';
import { getUTPLink, UTPService } from '../../services/utp';
import { useTranslation } from 'react-i18next';
const styles = require('./book-info.css').default

type TBookInfoProp = {
  uid: number
  book: WenquBook
}

function BookInfo({ book, uid }: TBookInfoProp) {
  const { t } = useTranslation()
  return (
    <Card className='mt-20 flex p-12 bg-blue-200 bg-opacity-50 flex-col md:flex-row'>
      <div className='mr-12'>
        <HideUntilLoaded
          imageToLoad={book.image}
        >
          <img src={book.image} className={styles.image + ' shadow rounded mr-4'} />
        </HideUntilLoaded>
      </div>

      <div className={styles.info}>
        <h2 className='my-4 text-4xl font-bold'>{book.title}</h2>
        <h5 className='my-4 text-2xl'>{book.author}</h5>
        <a
          href={getUTPLink(UTPService.book, { uid, bid: book.id })}
          target='_blank'
          className='bg-blue-400 py-2 px-4 mb-2 inline-block hover:underline'
        >
          {t('app.book.share')}
        </a>
        <p className='font-light leading-relaxed text-lg'>{book.summary}</p>
      </div>
    </Card>
  )
}

export default BookInfo
