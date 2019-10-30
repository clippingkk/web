import React from 'react'
import { IClippingItem } from '../../services/clippings';
import { Link } from '@reach/router';
import Card from '../card/card';

const styles = require('./clipping-item.css')

type TClippingItemProps = {
  item: IClippingItem,
  userid: number
}

function ClippingItem({ userid, item }: TClippingItemProps) {
  return (
    <Link
      to={`/dash/${userid}/clippings/${item.id}`}
      key={item.id}
      className={styles.clippingContainer}
    >
      <Card className={styles.clipping}>
        <h3 className='text-4xl'>{item.title}</h3>
        <hr className='my-4' />
        <p className='text-2xl text-gray-900'>{item.content}</p>
      </Card>
    </Link>
  )
}

export default ClippingItem
