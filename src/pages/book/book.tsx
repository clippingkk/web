import React, { useState, useEffect } from 'react'
import { IBook, searchBookDetail, getBookClippings } from '../../services/books';
import { IClippingItem } from '../../services/clippings';
const styles = require('./book.css')

type TBookPageProps = {
  userid: number,
  bookid: string
}

function getBook(doubanId: string): IBook {
  const [book, setBook] = useState({} as IBook)

  useEffect(() => {
    searchBookDetail(doubanId).then(res => {
      setBook(res)
    })
  }, [doubanId])

  return book
}

type bookClippingsState = {
  clippings: IClippingItem[],
  updatePage: (page: number) => void,
  hasMore: boolean
}

function getClippings(userid: number, bookId: string) {
  // TODO: add clipping
  const [clippings, setClippings] = useState([] as IClippingItem[])
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    getBookClippings(userid, bookId, offset).then(res => {
      setClippings(res)
    })
  }, [userid, bookId])

  return clippings
}

function BookPage({ userid, bookid } : TBookPageProps) {

  const book = getBook(bookid)
  const clippings = getClippings(userid, bookid)

  return (
    <section className={`${styles.bookPage} page`}>

    </section>
  )
}

export default BookPage
