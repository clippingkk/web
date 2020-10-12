import React from 'react'
import { IClippingItem } from '../../services/clippings';
import { Link } from '@reach/router';
import Card from '../card/card';
import { book_book_clippings } from '../../schema/__generated__/book'
import { WenquBook } from '../../services/wenqu';

const styles = require('./clipping-item.css')

type TClippingItemProps = {
  item: book_book_clippings
  book?: WenquBook
  userid: number
}

function ClippingItem({ userid, item, book }: TClippingItemProps) {
  return (
    <Link
      to={`/dash/${userid}/clippings/${item.id}`}
      key={item.id}
      className={styles.clippingContainer}
    >
      <Card className={styles.clipping}>
        <h3 className='text-3xl'>
          {book?.title ?? item.title}
        </h3>
        <hr className='my-4' />
        <p className='text-2xl text-gray-900'>{item.content}</p>
      </Card>
    </Link>
  )
}

export default ClippingItem
