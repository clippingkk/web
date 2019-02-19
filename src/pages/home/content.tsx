import React from 'react'
import { IClippingItem } from '../../services/clippings';
import { Link } from '@reach/router';
import Card from '../../components/card/card';
const styles = require('./content.css')

type TContentProps = {
  list: IClippingItem[],
  userid: number
}

type TNoContentProps = {
  userid: number
}

function NoContentAlert({ userid }: TNoContentProps) {
  return (
    <Link className={styles.none} to={`/dash/${userid}/upload`}>
      <h3 className={styles.tip}>什么！你竟然还没有读书笔记？</h3>
      <h3 className={styles.tip}>还不快点我上传</h3>
    </Link>
  )
}

function HomeContent(props: TContentProps) {
  if (props.list.length === 0) {
    return <NoContentAlert userid={props.userid} />
  }

  const list = props.list.map((item: IClippingItem) => (
      <Link
        to={`/dash/${props.userid}/clippings/${item.id}`}
        key={item.id}
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
