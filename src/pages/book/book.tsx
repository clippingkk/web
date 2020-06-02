import React, { useState, useEffect, useRef } from 'react'
import { IBook, searchBookDetail, getBookClippings } from '../../services/books';
import { IClippingItem } from '../../services/clippings';
import BookInfo from '../../components/book-info/book-info';
import ClippingItem from '../../components/clipping-item/clipping-item';
import ListFooter from '../../components/list-footer/list-footer';
import Divider from '../../components/divider/divider';
import { changeBackground } from '../../store/app/type';
import { connect } from 'react-redux';
import { usePageTrack } from '../../hooks/tracke';
const styles = require('./book.css')

type TBookPageProps = {
  userid: number,
  bookid: string,
  changeBackground: (bg: string) => void
}

function getBook(doubanId: string, onGetBook: (bg: string) => void): IBook {
  const [book, setBook] = useState({} as IBook)

  useEffect(() => {
    searchBookDetail(doubanId).then(res => {
      setBook(res)
      onGetBook(res.image)
    })
  }, [doubanId])

  return book
}

type bookClippingsState = {
  clippings: IClippingItem[],
  loadMore: () => Promise<any>,
  hasMore: boolean,
}

function getClippings(userid: number, bookId: string): bookClippingsState {
  const [clippings, setClippings] = useState([] as IClippingItem[])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  function loadMore() {
    return getBookClippings(userid, bookId, offset).then(res => {
      setClippings(clippings.concat(res))
      setOffset(offset + 20)
      if (res.length === 0) {
        setHasMore(false)
      }
    })
  }

  useEffect(() => {
    loadMore
  }, [userid, bookId])

  return {
    clippings,
    loadMore,
    hasMore,
  }
}

function mapActionToProps(dispatch: any) {
  return {
    changeBackground(bg: string) {
      return dispatch(changeBackground(bg))
    },
  }
}

function BookPage({ userid, bookid, changeBackground } : TBookPageProps) {
  usePageTrack('book', {
    bookId: bookid
  })
  const book = getBook(bookid, changeBackground)
  const { clippings, loadMore, hasMore } = getClippings(userid, bookid)

  return (
    <section className={`${styles.bookPage} page`}>
      <BookInfo book={book} />
      
      <Divider title='书摘' />

      <div className={styles.clippings}>
        {clippings.map(clipping => (
          <ClippingItem item={clipping} userid={userid} key={clipping.id} />
        ))}
        <ListFooter loadMoreFn={loadMore} hasMore={hasMore} />
      </div>
    </section>
  )
}

export default connect(null, mapActionToProps)(BookPage)
