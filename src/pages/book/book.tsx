import React, { useState, useEffect, useRef, useCallback } from 'react'
import { IBook, searchBookDetail, getBookClippings, IHttpBook, covertHttpBook2Book } from '../../services/books';
import { IClippingItem } from '../../services/clippings';
import BookInfo from '../../components/book-info/book-info';
import ClippingItem from '../../components/clipping-item/clipping-item';
import ListFooter from '../../components/list-footer/list-footer';
import Divider from '../../components/divider/divider';
import { changeBackground } from '../../store/app/type';
import { connect } from 'react-redux';
import { usePageTrack } from '../../hooks/tracke';
import useSWR, { useSWRPages } from 'swr';
const styles = require('./book.css')

type TBookPageProps = {
  userid: number,
  bookid: string,
  changeBackground: (bg: string) => void
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

function mapActionToProps(dispatch: any) {
  return {
    changeBackground(bg: string) {
      return dispatch(changeBackground(bg))
    },
  }
}

function BookPage({ userid, bookid, changeBackground }: TBookPageProps) {
  usePageTrack('book', {
    bookId: bookid
  })
  const { data: book } = useSWR<IHttpBook>(`/clippings/book/${bookid}`)

  const { clippings, loadMore, hasMore } = useBookClippings(userid, bookid)

  useEffect(() => {
    if (!book) {
      return
    }
    changeBackground(covertHttpBook2Book(book).image)
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
  }, [book, changeBackground])

  if (!book) {
    return null
  }

  return (
    <section className={`${styles.bookPage} page`}>
      <BookInfo book={covertHttpBook2Book(book)} />
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
