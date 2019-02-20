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
          <h3 className={styles.bookTitle}>{item.title}</h3>
          <hr />
          <p className={styles.bookContent}>{item.content}</p>
        </Card>
      </Link>
  )
}

export default ClippingItem
