import React from 'react'
import { IClippingItem } from '../../services/clippings';
import { Link } from '@reach/router';
import Card from '../../components/card/card';
import NoContentAlert from './no-content';
const styles = require('./content.css')

type TContentProps = {
  list: IClippingItem[],
  userid: number
}

function HomeContent(props: TContentProps) {
  if (props.list.length === 0) {
    return <NoContentAlert userid={props.userid} />
  }

  const list = props.list.map((item: IClippingItem) => (
      <Link
        to={`/dash/${props.userid}/clippings/${item.id}`}
        key={item.id}
        className={styles.clippingContainer}
      >
        <Card className={styles.clipping}>
          <h3 className={styles.bookTitle}>{item.title}</h3>
          <hr />
          <p className={styles.bookContent}>{item.content}</p>
        </Card>
      </Link>
  ))

  return (
    <React.Fragment>
      {list}
    </React.Fragment>
  )
}

export default HomeContent
