import React, { useState, useEffect, useRef, useCallback } from 'react'
import { IBook, searchBookDetail, getBookClippings, IHttpBook, covertHttpBook2Book } from '../../services/books';
import { IClippingItem } from '../../services/clippings';
import BookInfo from '../../components/book-info/book-info';
import ClippingItem from '../../components/clipping-item/clipping-item';
import ListFooter from '../../components/list-footer/list-footer';
import Divider from '../../components/divider/divider';
import { changeBackground } from '../../store/app/type';
import { connect, useDispatch } from 'react-redux';
import { usePageTrack } from '../../hooks/tracke';
import { useSingleBook } from '../../hooks/book'
const styles = require('./book.css')

type TBookPageProps = {
  userid: number,
  bookid: string,
  bookDoubanID: number,
}

function useBook(doubanId: string, onGetBook: (bg: string) => void): IBook {
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

function useBookClippings(userid: number, bookId: string): bookClippingsState {
  const [clippings, setClippings] = useState([] as IClippingItem[])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(() => {
    return getBookClippings(userid, bookId, offset).then(res => {
      setClippings(c => c.concat(res))
      setOffset(o => o + 20)
      if (res.length === 0) {
        setHasMore(false)
      }
    })
  }, [userid, bookId, offset])

  useEffect(() => {
    loadMore()
  }, [userid, bookId])

  return {
    clippings,
    loadMore,
    hasMore,
  }
}

function BookPage({ userid, bookid }: TBookPageProps) {
  usePageTrack('book', {
    bookId: bookid
  })
  const dispatch = useDispatch()
  const book = useSingleBook(bookid)

  const { clippings, loadMore, hasMore } = useBookClippings(userid, bookid)

  useEffect(() => {
    if (!book) {
      return
    }
    dispatch(changeBackground(book.image))
  }, [book, changeBackground])

  useEffect(() => {
    if (!book) {
      return
    }

    const oldTitle = document.title
    document.title = `${book.title} - clippingkk`

    return () => {
      document.title = oldTitle
    }
  }, [book])

  if (!book) {
    return null
  }

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

export default BookPage
