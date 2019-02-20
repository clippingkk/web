import React from 'react'
import { IClippingItem } from '../../services/clippings';
import NoContentAlert from './no-content';
import ClippingItem from '../../components/clipping-item/clipping-item';

type TContentProps = {
  list: IClippingItem[],
  userid: number
}

function HomeContent(props: TContentProps) {
  if (props.list.length === 0) {
    return <NoContentAlert userid={props.userid} />
  }

  const list = props.list.map((item: IClippingItem) => (
    <ClippingItem item={item} key={item.id} userid={props.userid} />
  ))

  return (
    <React.Fragment>
      {list}
    </React.Fragment>
  )
}

export default HomeContent
