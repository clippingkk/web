import React from 'react'
import { Link } from '@reach/router';
import Card from '../card/card';
import { book_book_clippings } from '../../schema/__generated__/book'
import { WenquBook } from '../../services/wenqu';
import { fetchSquareData_featuredClippings_creator } from '../../schema/__generated__/fetchSquareData';
import { useTranslation } from 'react-i18next';
import Avatar from '../avatar/avatar';

const styles = require('./clipping-item.css').default

type TClippingItemProps = {
  item: book_book_clippings
  book?: WenquBook
  userid: number
  creator?: fetchSquareData_featuredClippings_creator
}

function ClippingItem({ userid, item, book, creator }: TClippingItemProps) {
  const { t } = useTranslation()
  return (
    <Link
      to={`/dash/${userid}/clippings/${item.id}`}
      key={item.id}
      className={styles.clippingContainer}
    >
      <Card className={styles.clipping + ' lg:p-10 p-2 hover:shadow-2xl hover:scale-105 transform transition-all duration-300'}>
        <h3 className='lg:text-3xl text-xl'>
          {book?.title ?? item.title}
        </h3>
        <hr className='my-4' />
        <p className='lg:text-2xl text-gray-900'>{item.content}</p>
        {creator && (
          <React.Fragment>
            <hr className='my-4 self-end' />
            <div className='flex w-full justify-between'>
              <div className='flex justify-center items-center'>
                <Avatar
                  img={creator.avatar}
                  name={creator.name}
                  className='w-10 h-10 mr-4'
                />
                <span>{creator.name}</span>
              </div>
              <div>
                <span>{creator.clippingsCount} {t('app.profile.records')} </span>
              </div>
            </div>
          </React.Fragment>
        )}

      </Card>
    </Link>
  )
}

export default ClippingItem
